-- إضافة البيانات التجريبية لنظام Audit Trail

-- إضافة سجلات تدقيق متنوعة
INSERT INTO public.audit_logs_2025_12_15_23_00 (
    project_id,
    actor_user_id,
    actor_name,
    actor_role,
    action,
    entity_type,
    entity_id,
    entity_name,
    description,
    changes,
    category,
    severity
) VALUES 
-- أنشطة المشروع
('11111111-1111-1111-1111-111111111111', 'user1', 'أحمد محمد', 'project_manager', 'create', 'project', '11111111-1111-1111-1111-111111111111', 'نظام إدارة السياسات', 'إنشاء مشروع جديد', '{}', 'workflow', 'info'),

('11111111-1111-1111-1111-111111111111', 'user1', 'أحمد محمد', 'project_manager', 'update', 'project', '11111111-1111-1111-1111-111111111111', 'نظام إدارة السياسات', 'تحديث تواريخ المشروع', '{"old_dates": {"start": "2024-01-01", "end": "2024-06-30"}, "new_dates": {"start": "2024-01-15", "end": "2024-07-15"}}', 'workflow', 'info'),

('11111111-1111-1111-1111-111111111111', 'user2', 'سارة أحمد', 'consultant', 'create', 'deliverable', 'del1', 'تصميم واجهة المستخدم', 'إنشاء مخرج جديد', '{}', 'workflow', 'info'),

-- أنشطة المراجعة
('11111111-1111-1111-1111-111111111111', 'user2', 'سارة أحمد', 'consultant', 'submit', 'deliverable', 'del1', 'تصميم واجهة المستخدم', 'إرسال المخرج للمراجعة', '{}', 'workflow', 'info'),

('11111111-1111-1111-1111-111111111111', 'user3', 'محمد علي', 'reviewer', 'approve', 'review', 'rev1', 'مراجعة تصميم واجهة المستخدم', 'اعتماد المخرج بعد المراجعة', '{}', 'workflow', 'info'),

-- أنشطة الرسائل
('11111111-1111-1111-1111-111111111111', 'user4', 'فاطمة الزهراء', 'consultant', 'create', 'message', 'msg1', 'استفسار حول المتطلبات', 'إرسال رسالة استفسار', '{}', 'general', 'info'),

-- أنشطة الفريق
('11111111-1111-1111-1111-111111111111', 'user1', 'أحمد محمد', 'project_manager', 'add', 'team_member', 'tm1', 'خالد أحمد', 'إضافة عضو جديد للفريق', '{}', 'workflow', 'info'),

-- أنشطة الأمان
('11111111-1111-1111-1111-111111111111', 'user1', 'أحمد محمد', 'project_manager', 'grant', 'permission', 'perm1', 'صلاحية المراجعة', 'منح صلاحية المراجعة لعضو الفريق', '{}', 'security', 'warning'),

-- أنشطة النظام
('11111111-1111-1111-1111-111111111111', 'system', 'النظام', 'system', 'backup', 'database', NULL, 'نسخة احتياطية يومية', 'إنشاء نسخة احتياطية للبيانات', '{}', 'system', 'info'),

-- أنشطة الأخطاء
('11111111-1111-1111-1111-111111111111', 'user2', 'سارة أحمد', 'consultant', 'error', 'upload', NULL, 'فشل في رفع ملف', 'فشل في رفع ملف التصميم', '{"error": "حجم الملف كبير جداً", "file_size": "15MB"}', 'system', 'error'),

-- أنشطة حرجة
('11111111-1111-1111-1111-111111111111', 'system', 'النظام', 'system', 'crash', 'server', NULL, 'انقطاع الخدمة', 'انقطاع مؤقت في الخدمة', '{"duration": "5 دقائق", "cause": "تحديث النظام"}', 'system', 'critical');

-- إضافة إحصائيات الأنشطة
INSERT INTO public.activity_statistics_2025_12_15_23_00 (
    project_id,
    date_period,
    period_type,
    total_activities,
    create_count,
    update_count,
    delete_count,
    review_count,
    message_count,
    active_users_count,
    most_active_user_id,
    most_active_user_name,
    deliverables_modified,
    reviews_completed,
    messages_sent
) VALUES 
('11111111-1111-1111-1111-111111111111', '2024-01-20', 'daily', 25, 8, 12, 2, 3, 5, 4, 'user1', 'أحمد محمد', 3, 2, 5),
('11111111-1111-1111-1111-111111111111', '2024-01-19', 'daily', 18, 5, 8, 1, 2, 3, 3, 'user2', 'سارة أحمد', 2, 1, 3),
('11111111-1111-1111-1111-111111111111', '2024-01-18', 'daily', 15, 4, 6, 0, 1, 2, 3, 'user1', 'أحمد محمد', 1, 1, 2),

('22222222-2222-2222-2222-222222222222', '2024-01-20', 'daily', 12, 3, 5, 1, 2, 1, 3, 'user1', 'أحمد محمد', 1, 1, 1),
('22222222-2222-2222-2222-222222222222', '2024-01-19', 'daily', 8, 2, 3, 0, 1, 1, 2, 'user4', 'فاطمة الزهراء', 1, 0, 1);

-- إضافة جلسات المستخدمين
INSERT INTO public.user_sessions_2025_12_15_23_00 (
    project_id,
    user_id,
    session_id,
    ip_address,
    user_agent,
    started_at,
    last_activity_at,
    actions_count,
    pages_visited,
    features_used
) VALUES 
('11111111-1111-1111-1111-111111111111', 'user1', 'sess1', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-01-20T09:00:00Z', '2024-01-20T17:00:00Z', 45, '["/dashboard", "/projects", "/deliverables", "/reviews"]', '["create_deliverable", "assign_team", "review_approve"]'),

('11111111-1111-1111-1111-111111111111', 'user2', 'sess2', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2024-01-20T10:00:00Z', '2024-01-20T16:30:00Z', 32, '["/deliverables", "/reviews", "/messages"]', '["submit_deliverable", "send_message"]'),

('11111111-1111-1111-1111-111111111111', 'user3', 'sess3', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-01-20T11:00:00Z', '2024-01-20T15:00:00Z', 18, '["/reviews", "/dashboard"]', '["review_approve", "review_comment"]');

-- إضافة أخطاء النظام
INSERT INTO public.system_errors_2025_12_15_23_00 (
    project_id,
    user_id,
    error_type,
    error_message,
    error_code,
    stack_trace,
    page_url,
    user_action,
    browser_info,
    status
) VALUES 
(NULL, NULL, 'database_connection', 'فشل في الاتصال بقاعدة البيانات', 'DB_CONN_001', 'Connection timeout after 30 seconds', '/api/projects', 'load_projects', '{"browser": "Chrome", "version": "120.0"}', 'resolved'),

('11111111-1111-1111-1111-111111111111', 'user2', 'file_upload', 'حجم الملف يتجاوز الحد المسموح', 'FILE_SIZE_002', 'File size 15MB exceeds limit of 10MB', '/deliverables/upload', 'upload_design', '{"browser": "Firefox", "version": "118.0"}', 'open'),

('22222222-2222-2222-2222-222222222222', 'user4', 'validation_error', 'بيانات غير صحيحة في النموذج', 'VALIDATION_003', 'Required field "title" is missing', '/projects/create', 'create_project', '{"browser": "Safari", "version": "17.0"}', 'investigating');