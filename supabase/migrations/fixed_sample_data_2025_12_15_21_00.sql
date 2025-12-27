-- إصلاح البيانات التجريبية مع تصحيح الأخطاء

-- إدراج مشاريع تجريبية متقدمة (مصححة)
INSERT INTO projects_advanced_2025_12_15_21_00 (
  id, title, title_en, description, description_en,
  client_email, client_name, client_name_en, client_type,
  project_manager_email, project_manager_name,
  start_date, end_date, planned_start_date, planned_end_date,
  status, priority, progress_percentage, weighted_progress,
  budget, spent,
  technical_proposal_uploaded, contract_uploaded, project_charter_uploaded, can_be_activated,
  project_code, project_category, project_category_en,
  created_at
) VALUES
-- مشروع 1: تطوير النظام الإداري (مفعل)
('PROJ_ADV_001', 
 'مشروع تطوير النظام الإداري المتكامل', 
 'Integrated Administrative System Development Project',
 'تطوير نظام إداري شامل يغطي جميع العمليات الإدارية والمالية للشركة مع تكامل كامل مع الأنظمة الحالية',
 'Developing a comprehensive administrative system covering all administrative and financial operations with full integration with existing systems',
 'main@client.com', 'شركة الرياض للتجارة والصناعة', 'Riyadh Trading and Industry Company', 'main_client',
 'lead@consultant.com', 'أحمد محمد الخبير',
 '2024-01-15', '2024-08-15', '2024-01-15', '2024-08-15',
 'active', 'high', 65.50, 62.30,
 750000.00, 491250.00,
 true, true, true, true,
 'RTC-ADM-2024-001', 'تطوير الأنظمة', 'Systems Development',
 '2024-01-10 09:00:00+03'),

-- مشروع 2: استشارات الموارد البشرية (مفعل)
('PROJ_ADV_002',
 'مشروع استشارات الموارد البشرية الشاملة',
 'Comprehensive HR Consulting Project',
 'تقديم استشارات شاملة في إدارة الموارد البشرية تشمل إعادة هيكلة الإدارات وتطوير السياسات والإجراءات',
 'Providing comprehensive HR consulting including departmental restructuring and policy development',
 'client2@albayan.com', 'مؤسسة جدة للخدمات المتقدمة', 'Jeddah Advanced Services Foundation', 'main_client',
 'lead@consultant.com', 'فاطمة أحمد المستشارة',
 '2024-02-01', '2024-09-01', '2024-02-01', '2024-09-01',
 'active', 'medium', 45.20, 43.80,
 450000.00, 197100.00,
 true, true, true, true,
 'JAS-HR-2024-002', 'استشارات الموارد البشرية', 'HR Consulting',
 '2024-01-25 10:30:00+03'),

-- مشروع 3: التحول الرقمي (في انتظار التفعيل)
('PROJ_ADV_003',
 'مشروع التحول الرقمي الشامل',
 'Comprehensive Digital Transformation Project',
 'مساعدة الشركة في التحول الرقمي الشامل مع تطبيق أحدث التقنيات والممارسات الرقمية',
 'Helping the company in comprehensive digital transformation with latest technologies and digital practices',
 'main@client.com', 'شركة الرياض للتجارة والصناعة', 'Riyadh Trading and Industry Company', 'main_client',
 'lead@consultant.com', 'محمد علي التقني',
 '2024-03-01', '2024-12-01', '2024-03-01', '2024-12-01',
 'pending_activation', 'urgent', 0.00, 0.00,
 950000.00, 0.00,
 true, true, false, false, -- مخطط المشروع غير مرفوع
 'RTC-DT-2024-003', 'التحول الرقمي', 'Digital Transformation',
 '2024-02-20 14:15:00+03');

-- إدراج مراحل المشاريع
-- مراحل المشروع الأول (PROJ_ADV_001)
INSERT INTO project_phases_2025_12_15_21_00 (
  project_id, phase_name, phase_name_en, phase_order, description, description_en,
  start_date, end_date, planned_start_date, planned_end_date,
  status, progress_percentage, is_mandatory, weight_percentage
) VALUES
('PROJ_ADV_001', 'مرحلة التحليل', 'Analysis Phase', 1, 
 'تحليل تشغيلي وتحليل فجوة مع تقرير تحليل فجوة كمخرج رسمي',
 'Operational analysis and gap analysis with gap analysis report as formal deliverable',
 '2024-01-15', '2024-03-15', '2024-01-15', '2024-03-15',
 'completed', 100.00, true, 30.00),

('PROJ_ADV_001', 'مرحلة رسم الاحتياجات', 'Requirements Design Phase', 2,
 'مخرجات وفق العرض الفني وتوزيع المخرجات على المستشارين',
 'Deliverables according to technical proposal and distribution of deliverables to consultants',
 '2024-03-16', '2024-06-30', '2024-03-16', '2024-06-30',
 'in_progress', 75.00, true, 50.00),

('PROJ_ADV_001', 'مرحلة التدريب ونقل المعرفة', 'Training and Knowledge Transfer Phase', 3,
 'توثيق التدريب كمخرج حتى لو تم التدريب خارج المنصة',
 'Training documentation as deliverable even if training conducted outside the platform',
 '2024-07-01', '2024-08-15', '2024-07-01', '2024-08-15',
 'not_started', 0.00, true, 20.00);

-- مراحل المشروع الثاني (PROJ_ADV_002)
INSERT INTO project_phases_2025_12_15_21_00 (
  project_id, phase_name, phase_name_en, phase_order, description, description_en,
  start_date, end_date, planned_start_date, planned_end_date,
  status, progress_percentage, is_mandatory, weight_percentage
) VALUES
('PROJ_ADV_002', 'مرحلة التحليل', 'Analysis Phase', 1,
 'تحليل الوضع الحالي للموارد البشرية وتحديد الفجوات',
 'Current HR situation analysis and gap identification',
 '2024-02-01', '2024-04-01', '2024-02-01', '2024-04-01',
 'completed', 100.00, true, 30.00),

('PROJ_ADV_002', 'مرحلة رسم الاحتياجات', 'Requirements Design Phase', 2,
 'تصميم الهيكل التنظيمي الجديد والسياسات والإجراءات',
 'Designing new organizational structure and policies and procedures',
 '2024-04-02', '2024-07-15', '2024-04-02', '2024-07-15',
 'in_progress', 60.00, true, 50.00),

('PROJ_ADV_002', 'مرحلة التدريب ونقل المعرفة', 'Training and Knowledge Transfer Phase', 3,
 'تدريب فرق الموارد البشرية على النظام الجديد',
 'Training HR teams on the new system',
 '2024-07-16', '2024-09-01', '2024-07-16', '2024-09-01',
 'not_started', 0.00, true, 20.00);

-- إدراج مخرجات تجريبية (مصححة)
INSERT INTO deliverables_advanced_2025_12_15_21_00 (
  project_id, phase_id, title, title_en, description, description_en,
  assigned_consultant_email, assigned_consultant_name, consultant_role, consultant_role_en,
  start_date, end_date, planned_start_date, planned_end_date,
  weight_percentage, progress_percentage, quality_score,
  status, priority, is_milestone, requires_client_approval,
  deliverable_code
) VALUES
-- مخرجات المشروع الأول
('PROJ_ADV_001',
 (SELECT id FROM project_phases_2025_12_15_21_00 WHERE project_id = 'PROJ_ADV_001' AND phase_order = 1 LIMIT 1),
 'تقرير تحليل الفجوة الشامل', 'Comprehensive Gap Analysis Report',
 'تقرير مفصل يحلل الوضع الحالي للأنظمة الإدارية ويحدد الفجوات والتحسينات المطلوبة',
 'Detailed report analyzing current administrative systems status and identifying gaps and required improvements',
 'sub@consultant.com', 'علي أحمد المحلل', 'محلل أنظمة رئيسي', 'Senior Systems Analyst',
 '2024-01-15', '2024-02-28', '2024-01-15', '2024-02-28',
 15.00, 100.00, 95.00,
 'approved', 'high', true, true,
 'PROJ_ADV_001_DEL_001'),

('PROJ_ADV_001',
 (SELECT id FROM project_phases_2025_12_15_21_00 WHERE project_id = 'PROJ_ADV_001' AND phase_order = 1 LIMIT 1),
 'دراسة التحليل التشغيلي', 'Operational Analysis Study',
 'دراسة شاملة للعمليات التشغيلية الحالية مع توصيات للتحسين',
 'Comprehensive study of current operational processes with improvement recommendations',
 'sub@consultant.com', 'فاطمة محمد التشغيلية', 'مستشارة العمليات', 'Operations Consultant',
 '2024-02-01', '2024-03-15', '2024-02-01', '2024-03-15',
 15.00, 100.00, 88.00,
 'approved', 'medium', false, true,
 'PROJ_ADV_001_DEL_002'),

('PROJ_ADV_001',
 (SELECT id FROM project_phases_2025_12_15_21_00 WHERE project_id = 'PROJ_ADV_001' AND phase_order = 2 LIMIT 1),
 'تصميم قاعدة البيانات', 'Database Design',
 'تصميم مفصل لقاعدة البيانات الجديدة مع جميع الجداول والعلاقات',
 'Detailed design for new database with all tables and relationships',
 'lead@consultant.com', 'محمد علي المطور', 'مطور قواعد البيانات الرئيسي', 'Senior Database Developer',
 '2024-03-16', '2024-05-15', '2024-03-16', '2024-05-15',
 25.00, 80.00, 0.00,
 'in_progress', 'high', true, true,
 'PROJ_ADV_001_DEL_003'),

('PROJ_ADV_001',
 (SELECT id FROM project_phases_2025_12_15_21_00 WHERE project_id = 'PROJ_ADV_001' AND phase_order = 2 LIMIT 1),
 'واجهات المستخدم', 'User Interfaces',
 'تصميم وتطوير واجهات المستخدم للنظام الإداري الجديد',
 'Design and development of user interfaces for the new administrative system',
 'sub@consultant.com', 'سارة أحمد المصممة', 'مصممة واجهات المستخدم', 'UI/UX Designer',
 '2024-04-01', '2024-06-30', '2024-04-01', '2024-06-30',
 25.00, 70.00, 0.00,
 'in_progress', 'medium', false, true,
 'PROJ_ADV_001_DEL_004');

-- مخرجات المشروع الثاني
INSERT INTO deliverables_advanced_2025_12_15_21_00 (
  project_id, phase_id, title, title_en, description, description_en,
  assigned_consultant_email, assigned_consultant_name, consultant_role, consultant_role_en,
  start_date, end_date, planned_start_date, planned_end_date,
  weight_percentage, progress_percentage, quality_score,
  status, priority, is_milestone, requires_client_approval,
  deliverable_code
) VALUES
('PROJ_ADV_002',
 (SELECT id FROM project_phases_2025_12_15_21_00 WHERE project_id = 'PROJ_ADV_002' AND phase_order = 1 LIMIT 1),
 'تقرير تحليل الموارد البشرية', 'HR Analysis Report',
 'تقرير شامل عن الوضع الحالي للموارد البشرية والتحديات والفرص',
 'Comprehensive report on current HR status, challenges and opportunities',
 'lead@consultant.com', 'نورا خالد الخبيرة', 'خبيرة الموارد البشرية', 'HR Expert',
 '2024-02-01', '2024-03-15', '2024-02-01', '2024-03-15',
 30.00, 100.00, 92.00,
 'approved', 'high', true, true,
 'PROJ_ADV_002_DEL_001'),

('PROJ_ADV_002',
 (SELECT id FROM project_phases_2025_12_15_21_00 WHERE project_id = 'PROJ_ADV_002' AND phase_order = 2 LIMIT 1),
 'الهيكل التنظيمي الجديد', 'New Organizational Structure',
 'تصميم الهيكل التنظيمي الجديد مع توصيف الوظائف والمسؤوليات',
 'New organizational structure design with job descriptions and responsibilities',
 'sub@consultant.com', 'أحمد محمد التنظيمي', 'مستشار التطوير التنظيمي', 'Organizational Development Consultant',
 '2024-04-02', '2024-06-01', '2024-04-02', '2024-06-01',
 25.00, 75.00, 0.00,
 'under_review', 'high', true, true,
 'PROJ_ADV_002_DEL_002'),

('PROJ_ADV_002',
 (SELECT id FROM project_phases_2025_12_15_21_00 WHERE project_id = 'PROJ_ADV_002' AND phase_order = 2 LIMIT 1),
 'دليل السياسات والإجراءات', 'Policies and Procedures Manual',
 'دليل شامل للسياسات والإجراءات الجديدة للموارد البشرية',
 'Comprehensive manual for new HR policies and procedures',
 'lead@consultant.com', 'فاطمة علي السياسات', 'مستشارة السياسات', 'Policy Consultant',
 '2024-05-01', '2024-07-15', '2024-05-01', '2024-07-15',
 25.00, 45.00, 0.00,
 'in_progress', 'medium', false, true,
 'PROJ_ADV_002_DEL_003');

-- إدراج اجتماعات تجريبية
INSERT INTO meetings_2025_12_15_21_00 (
  meeting_title, meeting_title_en, description, description_en,
  project_id, scheduled_date, scheduled_time, duration_minutes,
  meeting_location, meeting_location_en, is_virtual, meeting_link,
  organizer_name, status, meeting_type, priority,
  requires_preparation, preparation_notes, preparation_notes_en
) VALUES
('اجتماع مراجعة تقدم المشروع الأول', 'Project Progress Review Meeting #1',
 'مراجعة شاملة لتقدم مشروع تطوير النظام الإداري ومناقشة التحديات',
 'Comprehensive review of administrative system development project progress and challenges discussion',
 'PROJ_ADV_001', '2024-12-20', '10:00:00', 90,
 'قاعة الاجتماعات الرئيسية', 'Main Conference Room', false, null,
 'أحمد محمد الخبير', 'scheduled', 'project_review', 'high',
 true, 'يرجى مراجعة تقارير التقدم المرسلة مسبقاً', 'Please review the progress reports sent earlier'),

('اجتماع مراجعة المخرجات', 'Deliverables Review Meeting',
 'مراجعة المخرجات المكتملة واعتماد الخطوات التالية',
 'Review completed deliverables and approve next steps',
 'PROJ_ADV_002', '2024-12-22', '14:00:00', 60,
 'قاعة الاجتماعات الفرعية', 'Secondary Meeting Room', true, 'https://meet.google.com/abc-defg-hij',
 'فاطمة أحمد المستشارة', 'scheduled', 'deliverable_review', 'medium',
 false, null, null);

-- إدراج سجل التوثيق الآلي
INSERT INTO audit_trail_2025_12_15_21_00 (
  entity_type, entity_id, action, action_description, action_description_en,
  performed_by_name, performed_by_role,
  project_id, search_keywords
) VALUES
('project', 'PROJ_ADV_001', 'create', 
 'تم إنشاء مشروع تطوير النظام الإداري المتكامل',
 'Created Integrated Administrative System Development Project',
 'أحمد محمد الخبير', 'مدير المشروع',
 'PROJ_ADV_001', 'مشروع إنشاء نظام إداري'),

('project', 'PROJ_ADV_002', 'create',
 'تم إنشاء مشروع استشارات الموارد البشرية الشاملة',
 'Created Comprehensive HR Consulting Project',
 'فاطمة أحمد المستشارة', 'مدير المشروع',
 'PROJ_ADV_002', 'مشروع موارد بشرية استشارات'),

('deliverable', 'PROJ_ADV_001_DEL_001', 'approve',
 'تم اعتماد تقرير تحليل الفجوة الشامل',
 'Approved Comprehensive Gap Analysis Report',
 'مدير المشروع من العميل', 'عميل رئيسي',
 'PROJ_ADV_001', 'اعتماد مخرج تقرير تحليل');