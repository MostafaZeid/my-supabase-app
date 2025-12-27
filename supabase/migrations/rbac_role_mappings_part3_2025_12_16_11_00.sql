-- ربط الأدوار بالصلاحيات - الجزء الثالث والأخير

-- صلاحيات العميل الرئيسي (CLIENT_MAIN)
INSERT INTO public.rbac_role_permissions_2025_12_16_11_00 (role_code, permission_code) VALUES 
-- إدارة العملاء (محدودة)
('CLIENT_MAIN', 'CLIENT_READ'),
('CLIENT_MAIN', 'CLIENT_USER_READ'),
('CLIENT_MAIN', 'CLIENT_USER_ADD'),
('CLIENT_MAIN', 'CLIENT_USER_REMOVE'),

-- إدارة المشاريع (قراءة فقط)
('CLIENT_MAIN', 'PROJECT_READ'),
('CLIENT_MAIN', 'PROJECT_DOCUMENT_READ'),

-- إدارة المخرجات (قراءة فقط)
('CLIENT_MAIN', 'DELIVERABLE_READ'),

-- سير عمل المراجعة (كاملة)
('CLIENT_MAIN', 'REVIEW_READ'),
('CLIENT_MAIN', 'REVIEW_ACK'),
('CLIENT_MAIN', 'REVIEW_COMMENT_CREATE'),
('CLIENT_MAIN', 'REVIEW_REQUEST_CHANGES'),
('CLIENT_MAIN', 'REVIEW_APPROVE'),

-- منح الوصول (كاملة)
('CLIENT_MAIN', 'GRANT_CREATE'),
('CLIENT_MAIN', 'GRANT_READ'),
('CLIENT_MAIN', 'GRANT_UPDATE'),
('CLIENT_MAIN', 'GRANT_DELETE'),

-- طلبات إعادة الفتح
('CLIENT_MAIN', 'REOPEN_REQUEST_CREATE'),
('CLIENT_MAIN', 'REOPEN_REQUEST_READ'),

-- الرسائل (أساسية)
('CLIENT_MAIN', 'MESSAGE_READ'),
('CLIENT_MAIN', 'MESSAGE_SEND'),

-- الاجتماعات (قراءة فقط)
('CLIENT_MAIN', 'MEETING_READ'),
('CLIENT_MAIN', 'MINUTES_READ'),
('CLIENT_MAIN', 'DECISION_READ'),

-- التقارير (محدودة)
('CLIENT_MAIN', 'REPORT_PROJECT_STATUS_READ'),
('CLIENT_MAIN', 'REPORT_DELIVERABLES_READ'),

-- إدارة الملفات
('CLIENT_MAIN', 'FILE_PRESIGN_CREATE');

-- صلاحيات العميل الفرعي (CLIENT_SUB)
INSERT INTO public.rbac_role_permissions_2025_12_16_11_00 (role_code, permission_code) VALUES 
-- إدارة المشاريع (قراءة فقط)
('CLIENT_SUB', 'PROJECT_READ'),

-- إدارة المخرجات (قراءة فقط)
('CLIENT_SUB', 'DELIVERABLE_READ'),

-- سير عمل المراجعة (محدودة)
('CLIENT_SUB', 'REVIEW_READ'),
('CLIENT_SUB', 'REVIEW_ACK'),
('CLIENT_SUB', 'REVIEW_COMMENT_CREATE'),
('CLIENT_SUB', 'REVIEW_REQUEST_CHANGES'),
('CLIENT_SUB', 'REVIEW_APPROVE'),

-- الرسائل (أساسية)
('CLIENT_SUB', 'MESSAGE_READ'),
('CLIENT_SUB', 'MESSAGE_SEND'),

-- الاجتماعات (قراءة فقط)
('CLIENT_SUB', 'MEETING_READ'),
('CLIENT_SUB', 'MINUTES_READ'),

-- إدارة الملفات
('CLIENT_SUB', 'FILE_PRESIGN_CREATE');