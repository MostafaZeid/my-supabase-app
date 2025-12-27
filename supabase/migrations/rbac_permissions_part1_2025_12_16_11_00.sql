-- إدراج الصلاحيات المفصلة - الجزء الأول

-- صلاحيات إدارة النظام (org_system)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('ORG_READ', 'org_system', 'قراءة تفاصيل المؤسسة'),
('ORG_UPDATE', 'org_system', 'تحديث إعدادات المؤسسة'),
('USER_CREATE', 'org_system', 'إنشاء مستخدمين'),
('USER_READ', 'org_system', 'قراءة المستخدمين'),
('USER_UPDATE', 'org_system', 'تحديث المستخدمين'),
('USER_DEACTIVATE', 'org_system', 'إلغاء تفعيل المستخدمين'),
('ROLE_CREATE', 'org_system', 'إنشاء أدوار'),
('ROLE_READ', 'org_system', 'قراءة الأدوار'),
('ROLE_UPDATE', 'org_system', 'تحديث الأدوار'),
('ROLE_DELETE', 'org_system', 'حذف الأدوار'),
('PERMISSION_READ', 'org_system', 'قراءة كتالوج الصلاحيات');

-- صلاحيات إدارة العملاء (clients)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('CLIENT_CREATE', 'clients', 'إنشاء عميل'),
('CLIENT_READ', 'clients', 'قراءة العميل'),
('CLIENT_UPDATE', 'clients', 'تحديث العميل'),
('CLIENT_DELETE', 'clients', 'حذف العميل'),
('CLIENT_USER_ADD', 'clients', 'إضافة مستخدم للعميل'),
('CLIENT_USER_REMOVE', 'clients', 'إزالة مستخدم من العميل'),
('CLIENT_USER_READ', 'clients', 'قراءة مستخدمي العميل');

-- صلاحيات إدارة المشاريع (projects)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('PROJECT_CREATE', 'projects', 'إنشاء مشروع'),
('PROJECT_READ', 'projects', 'قراءة المشروع'),
('PROJECT_UPDATE', 'projects', 'تحديث المشروع'),
('PROJECT_DELETE', 'projects', 'حذف المشروع'),
('PROJECT_ACTIVATE', 'projects', 'تفعيل المشروع'),
('PROJECT_CLOSE', 'projects', 'إغلاق المشروع'),
('PROJECT_MEMBERS_READ', 'projects', 'قراءة أعضاء المشروع'),
('PROJECT_MEMBER_ADD', 'projects', 'إضافة عضو للمشروع'),
('PROJECT_MEMBER_UPDATE', 'projects', 'تحديث عضو المشروع'),
('PROJECT_MEMBER_REMOVE', 'projects', 'إزالة عضو من المشروع'),
('PROJECT_TIMELINE_UPDATE', 'projects', 'تحديث الجدول الزمني للمشروع'),
('PROJECT_PHASE_INIT_DEFAULT', 'projects', 'تهيئة مراحل المشروع الافتراضية'),
('PROJECT_PHASE_READ', 'projects', 'قراءة مراحل المشروع'),
('PROJECT_PHASE_UPDATE', 'projects', 'تحديث مراحل المشروع'),
('PROJECT_DOCUMENT_UPLOAD', 'projects', 'رفع وثائق المشروع'),
('PROJECT_DOCUMENT_READ', 'projects', 'قراءة وثائق المشروع'),
('PROJECT_DOCUMENT_DELETE', 'projects', 'حذف وثائق المشروع');