-- توسيع نظام الأدوار والصلاحيات المتقدم
-- إضافة جدول الأدوار المرنة
CREATE TABLE IF NOT EXISTS user_roles_advanced_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) UNIQUE NOT NULL,
  role_name_en VARCHAR(50) NOT NULL,
  description TEXT,
  description_en TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج الأدوار الأساسية والجديدة
INSERT INTO user_roles_advanced_2025_12_15_21_00 (role_name, role_name_en, description, description_en, is_system_role) VALUES
('system_admin', 'System Administrator', 'مدير النظام مع صلاحيات كاملة', 'System administrator with full permissions', true),
('project_manager', 'Project Manager', 'مدير المشروع مع صلاحيات إدارة المشاريع', 'Project manager with project management permissions', true),
('lead_consultant', 'Lead Consultant', 'مستشار رئيسي مع صلاحيات متقدمة', 'Lead consultant with advanced permissions', true),
('sub_consultant', 'Sub Consultant', 'مستشار فرعي مع صلاحيات محدودة', 'Sub consultant with limited permissions', true),
('main_client', 'Main Client', 'عميل رئيسي مع صلاحيات المراجعة والاعتماد', 'Main client with review and approval permissions', true),
('sub_client', 'Sub Client', 'عميل فرعي مع صلاحيات محدودة', 'Sub client with limited permissions', true);

-- جدول الصلاحيات المفصلة
CREATE TABLE IF NOT EXISTS permissions_advanced_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key VARCHAR(100) UNIQUE NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  permission_name_en VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج الصلاحيات المفصلة
INSERT INTO permissions_advanced_2025_12_15_21_00 (permission_key, permission_name, permission_name_en, category, description, description_en) VALUES
-- صلاحيات المشاريع
('projects.create', 'إنشاء مشروع', 'Create Project', 'projects', 'إنشاء مشاريع جديدة', 'Create new projects'),
('projects.edit', 'تعديل مشروع', 'Edit Project', 'projects', 'تعديل تفاصيل المشاريع', 'Edit project details'),
('projects.delete', 'حذف مشروع', 'Delete Project', 'projects', 'حذف المشاريع', 'Delete projects'),
('projects.view', 'عرض مشروع', 'View Project', 'projects', 'عرض تفاصيل المشاريع', 'View project details'),
('projects.activate', 'تفعيل مشروع', 'Activate Project', 'projects', 'تفعيل المشاريع', 'Activate projects'),
('projects.close', 'إغلاق مشروع', 'Close Project', 'projects', 'إغلاق المشاريع نهائياً', 'Close projects permanently'),

-- صلاحيات المخرجات
('deliverables.create', 'إنشاء مخرج', 'Create Deliverable', 'deliverables', 'إنشاء مخرجات جديدة', 'Create new deliverables'),
('deliverables.edit', 'تعديل مخرج', 'Edit Deliverable', 'deliverables', 'تعديل المخرجات', 'Edit deliverables'),
('deliverables.delete', 'حذف مخرج', 'Delete Deliverable', 'deliverables', 'حذف المخرجات', 'Delete deliverables'),
('deliverables.view', 'عرض مخرج', 'View Deliverable', 'deliverables', 'عرض المخرجات', 'View deliverables'),
('deliverables.upload', 'رفع مخرج', 'Upload Deliverable', 'deliverables', 'رفع ملفات المخرجات', 'Upload deliverable files'),
('deliverables.review', 'مراجعة مخرج', 'Review Deliverable', 'deliverables', 'مراجعة المخرجات', 'Review deliverables'),
('deliverables.approve', 'اعتماد مخرج', 'Approve Deliverable', 'deliverables', 'اعتماد المخرجات', 'Approve deliverables'),
('deliverables.request_changes', 'طلب تعديلات', 'Request Changes', 'deliverables', 'طلب تعديلات على المخرجات', 'Request changes to deliverables'),
('deliverables.reopen', 'إعادة فتح مخرج', 'Reopen Deliverable', 'deliverables', 'إعادة فتح مخرج معتمد', 'Reopen approved deliverable'),

-- صلاحيات العملاء
('clients.create', 'إنشاء عميل', 'Create Client', 'clients', 'إنشاء عملاء جدد', 'Create new clients'),
('clients.edit', 'تعديل عميل', 'Edit Client', 'clients', 'تعديل بيانات العملاء', 'Edit client information'),
('clients.delete', 'حذف عميل', 'Delete Client', 'clients', 'حذف العملاء', 'Delete clients'),
('clients.view', 'عرض عميل', 'View Client', 'clients', 'عرض بيانات العملاء', 'View client information'),

-- صلاحيات المستشارين
('consultants.create', 'إنشاء مستشار', 'Create Consultant', 'consultants', 'إنشاء مستشارين جدد', 'Create new consultants'),
('consultants.edit', 'تعديل مستشار', 'Edit Consultant', 'consultants', 'تعديل بيانات المستشارين', 'Edit consultant information'),
('consultants.delete', 'حذف مستشار', 'Delete Consultant', 'consultants', 'حذف المستشارين', 'Delete consultants'),
('consultants.view', 'عرض مستشار', 'View Consultant', 'consultants', 'عرض بيانات المستشارين', 'View consultant information'),
('consultants.assign', 'تكليف مستشار', 'Assign Consultant', 'consultants', 'تكليف المستشارين بالمخرجات', 'Assign consultants to deliverables'),

-- صلاحيات التقارير
('reports.view', 'عرض تقارير', 'View Reports', 'reports', 'عرض التقارير', 'View reports'),
('reports.export', 'تصدير تقارير', 'Export Reports', 'reports', 'تصدير التقارير', 'Export reports'),
('reports.project_status', 'تقرير حالة المشروع', 'Project Status Report', 'reports', 'تقرير حالة المشروع', 'Project status report'),
('reports.time_tracking', 'تقرير الالتزام الزمني', 'Time Tracking Report', 'reports', 'تقرير الالتزام الزمني', 'Time tracking report'),
('reports.audit_trail', 'سجل العمليات', 'Audit Trail', 'reports', 'سجل العمليات الكامل', 'Complete audit trail'),

-- صلاحيات الاجتماعات
('meetings.create', 'إنشاء اجتماع', 'Create Meeting', 'meetings', 'إنشاء اجتماعات', 'Create meetings'),
('meetings.edit', 'تعديل اجتماع', 'Edit Meeting', 'meetings', 'تعديل الاجتماعات', 'Edit meetings'),
('meetings.view', 'عرض اجتماع', 'View Meeting', 'meetings', 'عرض الاجتماعات', 'View meetings'),
('meetings.minutes', 'محضر اجتماع', 'Meeting Minutes', 'meetings', 'كتابة محاضر الاجتماعات', 'Write meeting minutes'),

-- صلاحيات التواصل
('communication.send', 'إرسال رسالة', 'Send Message', 'communication', 'إرسال رسائل', 'Send messages'),
('communication.view', 'عرض رسائل', 'View Messages', 'communication', 'عرض الرسائل', 'View messages'),
('communication.moderate', 'إدارة التواصل', 'Moderate Communication', 'communication', 'إدارة التواصل', 'Moderate communication'),

-- صلاحيات النظام
('system.manage_users', 'إدارة المستخدمين', 'Manage Users', 'system', 'إدارة المستخدمين', 'Manage users'),
('system.manage_roles', 'إدارة الأدوار', 'Manage Roles', 'system', 'إدارة الأدوار والصلاحيات', 'Manage roles and permissions'),
('system.settings', 'إعدادات النظام', 'System Settings', 'system', 'إعدادات النظام', 'System settings');

-- جدول ربط الأدوار بالصلاحيات
CREATE TABLE IF NOT EXISTS role_permissions_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES user_roles_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(role_id, permission_id)
);

-- ربط الأدوار بالصلاحيات (مدير النظام - جميع الصلاحيات)
INSERT INTO role_permissions_2025_12_15_21_00 (role_id, permission_id)
SELECT r.id, p.id
FROM user_roles_advanced_2025_12_15_21_00 r, permissions_advanced_2025_12_15_21_00 p
WHERE r.role_name = 'system_admin';

-- ربط مدير المشروع بصلاحياته
INSERT INTO role_permissions_2025_12_15_21_00 (role_id, permission_id)
SELECT r.id, p.id
FROM user_roles_advanced_2025_12_15_21_00 r, permissions_advanced_2025_12_15_21_00 p
WHERE r.role_name = 'project_manager' 
AND p.permission_key IN (
  'projects.create', 'projects.edit', 'projects.view', 'projects.activate', 'projects.close',
  'deliverables.create', 'deliverables.edit', 'deliverables.view', 'deliverables.review', 'deliverables.reopen',
  'consultants.view', 'consultants.assign',
  'clients.view',
  'reports.view', 'reports.export', 'reports.project_status', 'reports.time_tracking', 'reports.audit_trail',
  'meetings.create', 'meetings.edit', 'meetings.view', 'meetings.minutes',
  'communication.send', 'communication.view', 'communication.moderate'
);

-- ربط المستشار الرئيسي بصلاحياته
INSERT INTO role_permissions_2025_12_15_21_00 (role_id, permission_id)
SELECT r.id, p.id
FROM user_roles_advanced_2025_12_15_21_00 r, permissions_advanced_2025_12_15_21_00 p
WHERE r.role_name = 'lead_consultant' 
AND p.permission_key IN (
  'projects.view', 'projects.edit',
  'deliverables.create', 'deliverables.edit', 'deliverables.view', 'deliverables.upload',
  'consultants.view', 'consultants.edit',
  'clients.view',
  'reports.view', 'reports.project_status',
  'meetings.view', 'meetings.minutes',
  'communication.send', 'communication.view'
);

-- ربط المستشار الفرعي بصلاحياته
INSERT INTO role_permissions_2025_12_15_21_00 (role_id, permission_id)
SELECT r.id, p.id
FROM user_roles_advanced_2025_12_15_21_00 r, permissions_advanced_2025_12_15_21_00 p
WHERE r.role_name = 'sub_consultant' 
AND p.permission_key IN (
  'projects.view',
  'deliverables.view', 'deliverables.upload',
  'consultants.view',
  'reports.view',
  'meetings.view',
  'communication.send', 'communication.view'
);

-- ربط العميل الرئيسي بصلاحياته
INSERT INTO role_permissions_2025_12_15_21_00 (role_id, permission_id)
SELECT r.id, p.id
FROM user_roles_advanced_2025_12_15_21_00 r, permissions_advanced_2025_12_15_21_00 p
WHERE r.role_name = 'main_client' 
AND p.permission_key IN (
  'projects.view',
  'deliverables.view', 'deliverables.review', 'deliverables.approve', 'deliverables.request_changes',
  'reports.view', 'reports.project_status',
  'meetings.view',
  'communication.send', 'communication.view'
);

-- ربط العميل الفرعي بصلاحياته
INSERT INTO role_permissions_2025_12_15_21_00 (role_id, permission_id)
SELECT r.id, p.id
FROM user_roles_advanced_2025_12_15_21_00 r, permissions_advanced_2025_12_15_21_00 p
WHERE r.role_name = 'sub_client' 
AND p.permission_key IN (
  'projects.view',
  'deliverables.view', 'deliverables.review',
  'reports.view',
  'meetings.view',
  'communication.view'
);

-- جدول صلاحيات المستخدمين المخصصة (لتخصيص صلاحيات فردية)
CREATE TABLE IF NOT EXISTS user_custom_permissions_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true,
  project_id VARCHAR(50), -- للصلاحيات على مستوى المشروع
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, permission_id, project_id)
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions_2025_12_15_21_00(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions_2025_12_15_21_00(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_permissions_user_id ON user_custom_permissions_2025_12_15_21_00(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_permissions_project_id ON user_custom_permissions_2025_12_15_21_00(project_id);

-- تعطيل RLS مؤقتاً للتطوير
ALTER TABLE user_roles_advanced_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions_advanced_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_permissions_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;

-- إضافة تعليقات
COMMENT ON TABLE user_roles_advanced_2025_12_15_21_00 IS 'جدول الأدوار المتقدمة والمرنة';
COMMENT ON TABLE permissions_advanced_2025_12_15_21_00 IS 'جدول الصلاحيات المفصلة';
COMMENT ON TABLE role_permissions_2025_12_15_21_00 IS 'ربط الأدوار بالصلاحيات';
COMMENT ON TABLE user_custom_permissions_2025_12_15_21_00 IS 'صلاحيات مخصصة للمستخدمين';