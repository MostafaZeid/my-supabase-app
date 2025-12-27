-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS clients_2025_12_17_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  company_en TEXT,
  address TEXT,
  address_en TEXT,
  contact_person TEXT,
  contact_person_en TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  client_type TEXT NOT NULL DEFAULT 'main_client' CHECK (client_type IN ('main_client', 'sub_client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المشاريع
CREATE TABLE IF NOT EXISTS projects_2025_12_17_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  client_id UUID REFERENCES clients_2025_12_17_09_00(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  project_manager TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول التذاكر
CREATE TABLE IF NOT EXISTS tickets_2025_12_17_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('technical', 'billing', 'general', 'feature_request', 'bug_report')),
  client_id UUID REFERENCES clients_2025_12_17_09_00(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects_2025_12_17_09_00(id) ON DELETE SET NULL,
  assigned_to TEXT,
  reporter_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الاجتماعات
CREATE TABLE IF NOT EXISTS meetings_2025_12_17_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  meeting_url TEXT,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  organizer TEXT,
  participants TEXT[],
  agenda JSONB,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستشارين
CREATE TABLE IF NOT EXISTS consultants_2025_12_17_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  full_name_en TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  position_en TEXT,
  department TEXT,
  department_en TEXT,
  specialization TEXT,
  specialization_en TEXT,
  experience_years INTEGER DEFAULT 0,
  biography TEXT,
  biography_en TEXT,
  location TEXT,
  location_en TEXT,
  consultant_code TEXT UNIQUE,
  profile_image TEXT,
  cv_document_url TEXT,
  cv_document_name TEXT,
  avatar_initials TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإشعارات والتقارير
CREATE TABLE IF NOT EXISTS notifications_reports_2025_12_17_09_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'notification' CHECK (type IN ('notification', 'report', 'alert')),
  title TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  user_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_clients_email_2025_12_17_09_00 ON clients_2025_12_17_09_00(email);
CREATE INDEX IF NOT EXISTS idx_clients_status_2025_12_17_09_00 ON clients_2025_12_17_09_00(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id_2025_12_17_09_00 ON projects_2025_12_17_09_00(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status_2025_12_17_09_00 ON projects_2025_12_17_09_00(status);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id_2025_12_17_09_00 ON tickets_2025_12_17_09_00(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id_2025_12_17_09_00 ON tickets_2025_12_17_09_00(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_2025_12_17_09_00 ON tickets_2025_12_17_09_00(status);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time_2025_12_17_09_00 ON meetings_2025_12_17_09_00(start_time);
CREATE INDEX IF NOT EXISTS idx_consultants_email_2025_12_17_09_00 ON consultants_2025_12_17_09_00(email);
CREATE INDEX IF NOT EXISTS idx_consultants_status_2025_12_17_09_00 ON consultants_2025_12_17_09_00(status);
CREATE INDEX IF NOT EXISTS idx_notifications_status_2025_12_17_09_00 ON notifications_reports_2025_12_17_09_00(status);

-- تفعيل Row Level Security
ALTER TABLE clients_2025_12_17_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_2025_12_17_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_2025_12_17_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings_2025_12_17_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultants_2025_12_17_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_reports_2025_12_17_09_00 ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Allow authenticated users to access clients" ON clients_2025_12_17_09_00
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to access projects" ON projects_2025_12_17_09_00
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to access tickets" ON tickets_2025_12_17_09_00
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to access meetings" ON meetings_2025_12_17_09_00
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to access consultants" ON consultants_2025_12_17_09_00
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to access notifications" ON notifications_reports_2025_12_17_09_00
  FOR ALL USING (auth.role() = 'authenticated');

-- إدراج البيانات التجريبية
INSERT INTO clients_2025_12_17_09_00 (name, name_en, email, phone, company, company_en, contact_person, status, client_type) VALUES
('شركة التقنية المتقدمة', 'Advanced Technology Company', 'info@advtech.sa', '+966501234567', 'شركة التقنية المتقدمة', 'Advanced Technology Company', 'أحمد محمد', 'active', 'main_client'),
('مؤسسة الابتكار الرقمي', 'Digital Innovation Foundation', 'contact@digiinnovation.com', '+966502345678', 'مؤسسة الابتكار الرقمي', 'Digital Innovation Foundation', 'فاطمة علي', 'active', 'main_client'),
('شركة الحلول الذكية', 'Smart Solutions Company', 'hello@smartsolutions.sa', '+966503456789', 'شركة الحلول الذكية', 'Smart Solutions Company', 'محمد خالد', 'active', 'sub_client');

INSERT INTO projects_2025_12_17_09_00 (name, name_en, description, description_en, client_id, status, priority, start_date, end_date, budget, progress, project_manager) VALUES
('تطوير نظام إدارة المحتوى', 'Content Management System Development', 'تطوير نظام شامل لإدارة المحتوى الرقمي', 'Comprehensive digital content management system development', (SELECT id FROM clients_2025_12_17_09_00 WHERE email = 'info@advtech.sa'), 'active', 'high', '2024-01-15', '2024-06-15', 150000.00, 65, 'أحمد المدير'),
('منصة التجارة الإلكترونية', 'E-commerce Platform', 'بناء منصة متكاملة للتجارة الإلكترونية', 'Building an integrated e-commerce platform', (SELECT id FROM clients_2025_12_17_09_00 WHERE email = 'contact@digiinnovation.com'), 'planning', 'medium', '2024-03-01', '2024-09-01', 200000.00, 25, 'سارة المطور');

INSERT INTO tickets_2025_12_17_09_00 (title, description, status, priority, category, client_id, project_id, assigned_to, reporter_email) VALUES
('مشكلة في تسجيل الدخول', 'المستخدمون يواجهون صعوبة في تسجيل الدخول للنظام', 'open', 'high', 'technical', (SELECT id FROM clients_2025_12_17_09_00 WHERE email = 'info@advtech.sa'), (SELECT id FROM projects_2025_12_17_09_00 WHERE name = 'تطوير نظام إدارة المحتوى'), 'فريق الدعم التقني', 'support@advtech.sa');

INSERT INTO meetings_2025_12_17_09_00 (title, description, start_time, end_time, location, status, organizer, participants) VALUES
('اجتماع مراجعة المشروع', 'مراجعة تقدم المشروع ومناقشة المرحلة التالية', '2024-12-20 10:00:00+03', '2024-12-20 11:30:00+03', 'قاعة الاجتماعات الرئيسية', 'SCHEDULED', 'أحمد المدير', ARRAY['فريق التطوير', 'العميل', 'مدير المشروع']),
('ورشة عمل التدريب', 'تدريب الفريق على التقنيات الجديدة', '2024-12-22 14:00:00+03', '2024-12-22 17:00:00+03', 'قاعة التدريب', 'SCHEDULED', 'سارة المطور', ARRAY['فريق التطوير', 'المدربين']);

INSERT INTO consultants_2025_12_17_09_00 (full_name, full_name_en, email, phone, position, position_en, department, department_en, specialization, specialization_en, experience_years, biography, biography_en, status, consultant_code) VALUES
('د. محمد أحمد الخبير', 'Dr. Mohammed Ahmed Al-Khabeer', 'mohammed.expert@company.com', '+966501111111', 'مستشار تقني أول', 'Senior Technical Consultant', 'قسم التطوير', 'Development Department', 'تطوير الأنظمة', 'Systems Development', 8, 'خبير في تطوير الأنظمة المتقدمة مع خبرة 8 سنوات', 'Expert in advanced systems development with 8 years experience', 'active', 'CONS001'),
('أ. فاطمة علي المحلل', 'Ms. Fatima Ali Al-Muhalil', 'fatima.analyst@company.com', '+966502222222', 'محلل أعمال', 'Business Analyst', 'قسم التحليل', 'Analysis Department', 'تحليل الأعمال', 'Business Analysis', 5, 'محللة أعمال متخصصة في تحليل المتطلبات', 'Business analyst specialized in requirements analysis', 'active', 'CONS002');

INSERT INTO notifications_reports_2025_12_17_09_00 (type, title, message, status, priority) VALUES
('notification', 'مشروع جديد تم إضافته', 'تم إضافة مشروع "تطوير نظام إدارة المحتوى" بنجاح', 'unread', 'medium'),
('alert', 'تذكير: اجتماع قادم', 'لديك اجتماع مراجعة المشروع غداً في الساعة 10:00 صباحاً', 'unread', 'high'),
('report', 'تقرير أسبوعي', 'تقرير أداء المشاريع للأسبوع الماضي', 'read', 'low');