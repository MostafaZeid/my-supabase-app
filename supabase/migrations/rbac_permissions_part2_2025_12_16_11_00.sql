-- إدراج الصلاحيات المفصلة - الجزء الثاني

-- صلاحيات إدارة المخرجات (deliverables)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('DELIVERABLE_CREATE', 'deliverables', 'إنشاء مخرج'),
('DELIVERABLE_READ', 'deliverables', 'قراءة المخرج'),
('DELIVERABLE_UPDATE', 'deliverables', 'تحديث المخرج'),
('DELIVERABLE_STATUS_UPDATE', 'deliverables', 'تحديث حالة المخرج'),
('DELIVERABLE_WEIGHT_UPDATE', 'deliverables', 'تحديث وزن المخرج'),
('DELIVERABLE_ASSIGN_CREATE', 'deliverables', 'تكليف مستخدم بمخرج'),
('DELIVERABLE_ASSIGN_READ', 'deliverables', 'قراءة تكليفات المخرج'),
('DELIVERABLE_ASSIGN_UPDATE', 'deliverables', 'تحديث تكليف المخرج'),
('DELIVERABLE_ASSIGN_DELETE', 'deliverables', 'حذف تكليف المخرج');

-- صلاحيات إدارة الإصدارات (versions)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('DELIVERABLE_VERSION_CREATE', 'versions', 'إنشاء إصدار مخرج'),
('DELIVERABLE_VERSION_READ', 'versions', 'قراءة إصدارات المخرج');

-- صلاحيات سير عمل المراجعة (workflow_reviews)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('DELIVERABLE_SUBMIT_FOR_REVIEW', 'workflow_reviews', 'إرسال المخرج للمراجعة'),
('REVIEW_READ', 'workflow_reviews', 'قراءة المراجعة'),
('REVIEW_ACK', 'workflow_reviews', 'إقرار المراجعة'),
('REVIEW_COMMENT_CREATE', 'workflow_reviews', 'إنشاء تعليق مراجعة'),
('REVIEW_REQUEST_CHANGES', 'workflow_reviews', 'طلب تعديلات'),
('REVIEW_RESPOND', 'workflow_reviews', 'الرد على المراجعة'),
('REVIEW_APPROVE', 'workflow_reviews', 'اعتماد المخرج');

-- صلاحيات طلبات إعادة الفتح (reopen)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('REOPEN_REQUEST_CREATE', 'reopen', 'إنشاء طلب إعادة فتح'),
('REOPEN_REQUEST_READ', 'reopen', 'قراءة طلب إعادة الفتح'),
('REOPEN_REQUEST_DECIDE', 'reopen', 'البت في طلب إعادة الفتح');

-- صلاحيات منح الوصول (grants)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('GRANT_CREATE', 'grants', 'إنشاء منحة وصول للمخرج'),
('GRANT_READ', 'grants', 'قراءة منحة وصول للمخرج'),
('GRANT_UPDATE', 'grants', 'تحديث منحة وصول للمخرج'),
('GRANT_DELETE', 'grants', 'حذف منحة وصول للمخرج');

-- صلاحيات الرسائل (messaging)
INSERT INTO public.rbac_permissions_2025_12_16_11_00 (code, category_code, description) VALUES 
('MESSAGE_READ', 'messaging', 'قراءة الرسائل'),
('MESSAGE_SEND', 'messaging', 'إرسال رسالة'),
('MESSAGE_PM_VIEW_ALL', 'messaging', 'مدير المشروع يمكنه رؤية جميع الرسائل');