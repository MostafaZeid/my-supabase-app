-- ربط الأدوار بالصلاحيات - الجزء الثاني

-- صلاحيات المستشار (CONSULTANT)
INSERT INTO public.rbac_role_permissions_2025_12_16_11_00 (role_code, permission_code) VALUES 
-- إدارة المشاريع (قراءة فقط)
('CONSULTANT', 'PROJECT_READ'),
('CONSULTANT', 'PROJECT_PHASE_READ'),
('CONSULTANT', 'PROJECT_DOCUMENT_READ'),

-- إدارة المخرجات (محدودة)
('CONSULTANT', 'DELIVERABLE_READ'),
('CONSULTANT', 'DELIVERABLE_UPDATE'),

-- إدارة الإصدارات (كاملة)
('CONSULTANT', 'DELIVERABLE_VERSION_CREATE'),
('CONSULTANT', 'DELIVERABLE_VERSION_READ'),

-- سير عمل المراجعة
('CONSULTANT', 'DELIVERABLE_SUBMIT_FOR_REVIEW'),
('CONSULTANT', 'REVIEW_READ'),
('CONSULTANT', 'REVIEW_COMMENT_CREATE'),
('CONSULTANT', 'REVIEW_RESPOND'),

-- الرسائل (أساسية)
('CONSULTANT', 'MESSAGE_READ'),
('CONSULTANT', 'MESSAGE_SEND'),

-- الاجتماعات (قراءة فقط)
('CONSULTANT', 'MEETING_READ'),
('CONSULTANT', 'MINUTES_READ'),
('CONSULTANT', 'DECISION_READ'),

-- إدارة الملفات
('CONSULTANT', 'FILE_PRESIGN_CREATE');

-- صلاحيات المستشار الفرعي (SUB_CONSULTANT)
INSERT INTO public.rbac_role_permissions_2025_12_16_11_00 (role_code, permission_code) VALUES 
-- إدارة المشاريع (قراءة فقط)
('SUB_CONSULTANT', 'PROJECT_READ'),

-- إدارة المخرجات (قراءة فقط)
('SUB_CONSULTANT', 'DELIVERABLE_READ'),

-- إدارة الإصدارات (كاملة)
('SUB_CONSULTANT', 'DELIVERABLE_VERSION_CREATE'),
('SUB_CONSULTANT', 'DELIVERABLE_VERSION_READ'),

-- سير عمل المراجعة (محدودة)
('SUB_CONSULTANT', 'DELIVERABLE_SUBMIT_FOR_REVIEW'),
('SUB_CONSULTANT', 'REVIEW_READ'),
('SUB_CONSULTANT', 'REVIEW_RESPOND'),

-- الرسائل (أساسية)
('SUB_CONSULTANT', 'MESSAGE_READ'),
('SUB_CONSULTANT', 'MESSAGE_SEND'),

-- إدارة الملفات
('SUB_CONSULTANT', 'FILE_PRESIGN_CREATE');