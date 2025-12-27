-- نظام إدارة المشاريع المتقدم
-- جدول المشاريع المحسن
CREATE TABLE IF NOT EXISTS projects_advanced_2025_12_15_21_00 (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  
  -- معلومات العميل
  client_id UUID REFERENCES auth.users(id),
  client_email VARCHAR(255) NOT NULL,
  client_name VARCHAR(200) NOT NULL,
  client_name_en VARCHAR(200),
  client_type VARCHAR(20) DEFAULT 'main_client', -- main_client, sub_client
  
  -- معلومات مدير المشروع
  project_manager_id UUID REFERENCES auth.users(id),
  project_manager_email VARCHAR(255),
  project_manager_name VARCHAR(200),
  
  -- الجدول الزمني
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- حالة المشروع
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending_activation, active, on_hold, completed, closed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  
  -- التقدم والميزانية
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  weighted_progress DECIMAL(5,2) DEFAULT 0.00,
  budget DECIMAL(15,2) DEFAULT 0,
  spent DECIMAL(15,2) DEFAULT 0,
  
  -- المتطلبات الإلزامية للتفعيل
  technical_proposal_uploaded BOOLEAN DEFAULT false,
  contract_uploaded BOOLEAN DEFAULT false,
  project_charter_uploaded BOOLEAN DEFAULT false,
  can_be_activated BOOLEAN DEFAULT false,
  
  -- تواريخ مهمة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- معلومات إضافية
  project_code VARCHAR(50) UNIQUE,
  project_category VARCHAR(100),
  project_category_en VARCHAR(100),
  
  -- حقول التتبع
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_dates CHECK (start_date <= end_date),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_weighted_progress CHECK (weighted_progress >= 0 AND weighted_progress <= 100)
);

-- جدول مراحل المشروع الإجبارية
CREATE TABLE IF NOT EXISTS project_phases_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) REFERENCES projects_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  phase_name VARCHAR(100) NOT NULL,
  phase_name_en VARCHAR(100) NOT NULL,
  phase_order INTEGER NOT NULL,
  description TEXT,
  description_en TEXT,
  
  -- الجدول الزمني للمرحلة
  start_date DATE,
  end_date DATE,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- حالة المرحلة
  status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed, on_hold
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- معلومات إضافية
  is_mandatory BOOLEAN DEFAULT true,
  weight_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, phase_order),
  CONSTRAINT valid_phase_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_phase_weight CHECK (weight_percentage >= 0 AND weight_percentage <= 100)
);

-- جدول المخرجات المتقدم
CREATE TABLE IF NOT EXISTS deliverables_advanced_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) REFERENCES projects_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات المخرج
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  deliverable_code VARCHAR(50),
  
  -- المستشار المسؤول
  assigned_consultant_id UUID REFERENCES auth.users(id),
  assigned_consultant_email VARCHAR(255),
  assigned_consultant_name VARCHAR(200),
  consultant_role VARCHAR(100), -- دور المستشار في هذا المخرج
  consultant_role_en VARCHAR(100),
  
  -- الجدول الزمني
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- الوزن النسبي والتقدم
  weight_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  quality_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- حالة المخرج
  status VARCHAR(50) DEFAULT 'not_started', 
  -- not_started, in_progress, submitted, under_review, changes_requested, approved, closed
  
  -- معلومات الرفع والمراجعة
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  
  -- ملاحظات ومراجعات
  client_notes TEXT,
  client_notes_en TEXT,
  consultant_notes TEXT,
  consultant_notes_en TEXT,
  review_notes TEXT,
  review_notes_en TEXT,
  
  -- معلومات إضافية
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  is_milestone BOOLEAN DEFAULT false,
  requires_client_approval BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_deliverable_dates CHECK (start_date <= end_date),
  CONSTRAINT valid_deliverable_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_deliverable_weight CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
  CONSTRAINT valid_quality_score CHECK (quality_score >= 0 AND quality_score <= 100)
);

-- جدول ملفات المخرجات مع Version Control
CREATE TABLE IF NOT EXISTS deliverable_files_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID REFERENCES deliverables_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات الملف
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  mime_type VARCHAR(100),
  
  -- Version Control
  version_number INTEGER DEFAULT 1,
  version_notes TEXT,
  is_current_version BOOLEAN DEFAULT true,
  
  -- معلومات الرفع
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- معلومات إضافية
  file_category VARCHAR(50), -- document, image, video, other
  is_final_version BOOLEAN DEFAULT false,
  
  UNIQUE(deliverable_id, version_number)
);

-- جدول سجل التوثيق الآلي (Audit Trail)
CREATE TABLE IF NOT EXISTS audit_trail_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات العملية
  entity_type VARCHAR(50) NOT NULL, -- project, deliverable, file, etc.
  entity_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL, -- create, update, delete, submit, approve, etc.
  
  -- تفاصيل العملية
  action_description TEXT,
  action_description_en TEXT,
  old_values JSONB,
  new_values JSONB,
  
  -- معلومات المستخدم
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name VARCHAR(200),
  performed_by_role VARCHAR(50),
  
  -- معلومات إضافية
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  
  -- التوقيت
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- معلومات السياق
  project_id VARCHAR(50),
  client_id UUID,
  
  -- فهرسة للبحث السريع
  search_keywords TEXT
);

-- جدول طلبات إعادة فتح المخرجات
CREATE TABLE IF NOT EXISTS deliverable_reopen_requests_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID REFERENCES deliverables_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  project_id VARCHAR(50) REFERENCES projects_advanced_2025_12_15_21_00(id),
  
  -- معلومات الطلب
  request_reason TEXT NOT NULL,
  request_reason_en TEXT,
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- معلومات الموافقة
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id), -- مدير المشروع
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  review_notes_en TEXT,
  
  -- معلومات إضافية
  urgency VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  business_justification TEXT,
  business_justification_en TEXT
);

-- إدراج المراحل الإجبارية لكل مشروع (Template)
CREATE TABLE IF NOT EXISTS project_phase_templates_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_name VARCHAR(100) NOT NULL,
  phase_name_en VARCHAR(100) NOT NULL,
  phase_order INTEGER NOT NULL,
  description TEXT,
  description_en TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  default_weight_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  UNIQUE(phase_order)
);

-- إدراج المراحل الإجبارية
INSERT INTO project_phase_templates_2025_12_15_21_00 (phase_name, phase_name_en, phase_order, description, description_en, is_mandatory, default_weight_percentage) VALUES
('مرحلة التحليل', 'Analysis Phase', 1, 'تحليل تشغيلي وتحليل فجوة مع تقرير تحليل فجوة كمخرج رسمي', 'Operational analysis and gap analysis with gap analysis report as formal deliverable', true, 30.00),
('مرحلة رسم الاحتياجات', 'Requirements Design Phase', 2, 'مخرجات وفق العرض الفني وتوزيع المخرجات على المستشارين', 'Deliverables according to technical proposal and distribution of deliverables to consultants', true, 50.00),
('مرحلة التدريب ونقل المعرفة', 'Training and Knowledge Transfer Phase', 3, 'توثيق التدريب كمخرج حتى لو تم التدريب خارج المنصة', 'Training documentation as deliverable even if training conducted outside the platform', true, 20.00);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_projects_advanced_client_id ON projects_advanced_2025_12_15_21_00(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_advanced_manager_id ON projects_advanced_2025_12_15_21_00(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_advanced_status ON projects_advanced_2025_12_15_21_00(status);
CREATE INDEX IF NOT EXISTS idx_projects_advanced_dates ON projects_advanced_2025_12_15_21_00(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases_2025_12_15_21_00(project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_order ON project_phases_2025_12_15_21_00(phase_order);

CREATE INDEX IF NOT EXISTS idx_deliverables_advanced_project_id ON deliverables_advanced_2025_12_15_21_00(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_advanced_phase_id ON deliverables_advanced_2025_12_15_21_00(phase_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_advanced_consultant_id ON deliverables_advanced_2025_12_15_21_00(assigned_consultant_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_advanced_status ON deliverables_advanced_2025_12_15_21_00(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_advanced_dates ON deliverables_advanced_2025_12_15_21_00(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_deliverable_files_deliverable_id ON deliverable_files_2025_12_15_21_00(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_files_version ON deliverable_files_2025_12_15_21_00(version_number);
CREATE INDEX IF NOT EXISTS idx_deliverable_files_current ON deliverable_files_2025_12_15_21_00(is_current_version);

CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail_2025_12_15_21_00(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed_by ON audit_trail_2025_12_15_21_00(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed_at ON audit_trail_2025_12_15_21_00(performed_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_project_id ON audit_trail_2025_12_15_21_00(project_id);

-- تعطيل RLS مؤقتاً للتطوير
ALTER TABLE projects_advanced_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables_advanced_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_files_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_reopen_requests_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_phase_templates_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;

-- إضافة تعليقات
COMMENT ON TABLE projects_advanced_2025_12_15_21_00 IS 'جدول المشاريع المتقدم مع المتطلبات الإلزامية';
COMMENT ON TABLE project_phases_2025_12_15_21_00 IS 'مراحل المشروع الإجبارية';
COMMENT ON TABLE deliverables_advanced_2025_12_15_21_00 IS 'المخرجات المتقدمة مع workflow الاعتماد';
COMMENT ON TABLE deliverable_files_2025_12_15_21_00 IS 'ملفات المخرجات مع Version Control';
COMMENT ON TABLE audit_trail_2025_12_15_21_00 IS 'سجل التوثيق الآلي غير قابل للتعديل';
COMMENT ON TABLE deliverable_reopen_requests_2025_12_15_21_00 IS 'طلبات إعادة فتح المخرجات المعتمدة';
COMMENT ON TABLE project_phase_templates_2025_12_15_21_00 IS 'قوالب المراحل الإجبارية للمشاريع';