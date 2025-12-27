-- إدراج الصلاحيات المفصلة - الجزء الثالث والأخير

-- صلاحيات الاجتماعات (meetings)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('MEETING_CREATE', 'meetings', 'إنشاء اجتماع'),
('MEETING_READ', 'meetings', 'قراءة الاجتماعات'),
('MEETING_UPDATE', 'meetings', 'تحديث الاجتماع'),
('MEETING_DELETE', 'meetings', 'حذف الاجتماع'),
('MINUTES_CREATE', 'meetings', 'إنشاء محضر اجتماع'),
('MINUTES_READ', 'meetings', 'قراءة محاضر الاجتماعات'),
('DECISION_CREATE', 'meetings', 'إنشاء قرار'),
('DECISION_UPDATE', 'meetings', 'تحديث القرار'),
('DECISION_READ', 'meetings', 'قراءة القرار');

-- صلاحيات التقارير والتدقيق (reports_audit)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('REPORT_PROJECT_STATUS_READ', 'reports_audit', 'قراءة تقرير حالة المشروع'),
('REPORT_TIMELINE_READ', 'reports_audit', 'قراءة تقرير الجدول الزمني للمشروع'),
('REPORT_DELIVERABLES_READ', 'reports_audit', 'قراءة تقرير المخرجات'),
('REPORT_CLIENT_DELAYS_READ', 'reports_audit', 'قراءة تقرير تأخيرات العميل'),
('AUDIT_LOG_READ', 'reports_audit', 'قراءة سجل التدقيق'),
('AUDIT_LOG_EXPORT', 'reports_audit', 'تصدير سجل التدقيق');

-- صلاحيات إدارة الملفات (files)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('FILE_PRESIGN_CREATE', 'files', 'إنشاء رابط رفع ملف مؤقت');