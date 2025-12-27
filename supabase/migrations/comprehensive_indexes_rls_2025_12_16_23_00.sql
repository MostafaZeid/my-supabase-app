-- ==========================================
-- الفهارس وسياسات الأمان للمنصة الشاملة
-- ==========================================

-- ==========================================
-- الفهارس لتحسين الأداء
-- ==========================================

-- فهارس المستخدمين
CREATE INDEX idx_user_profiles_email_2025 ON user_profiles_2025_12_16_23_00(email);
CREATE INDEX idx_user_profiles_role_2025 ON user_profiles_2025_12_16_23_00(role);
CREATE INDEX idx_user_profiles_active_2025 ON user_profiles_2025_12_16_23_00(is_active);

-- فهارس العملاء
CREATE INDEX idx_clients_email_2025 ON clients_2025_12_16_23_00(email);
CREATE INDEX idx_clients_company_2025 ON clients_2025_12_16_23_00(company);
CREATE INDEX idx_clients_active_2025 ON clients_2025_12_16_23_00(is_active);
CREATE INDEX idx_clients_created_2025 ON clients_2025_12_16_23_00(created_at);

-- فهارس الاستشاريين
CREATE INDEX idx_consultants_email_2025 ON consultants_2025_12_16_23_00(email);
CREATE INDEX idx_consultants_specialization_2025 ON consultants_2025_12_16_23_00(specialization);
CREATE INDEX idx_consultants_active_2025 ON consultants_2025_12_16_23_00(is_active);
CREATE INDEX idx_consultants_user_2025 ON consultants_2025_12_16_23_00(user_id);

-- فهارس المشاريع
CREATE INDEX idx_projects_client_2025 ON projects_2025_12_16_23_00(client_id);
CREATE INDEX idx_projects_manager_2025 ON projects_2025_12_16_23_00(project_manager_id);
CREATE INDEX idx_projects_status_2025 ON projects_2025_12_16_23_00(status);
CREATE INDEX idx_projects_dates_2025 ON projects_2025_12_16_23_00(start_date, end_date);
CREATE INDEX idx_projects_active_2025 ON projects_2025_12_16_23_00(is_active);

-- فهارس فرق المشاريع
CREATE INDEX idx_project_teams_project_2025 ON project_teams_2025_12_16_23_00(project_id);
CREATE INDEX idx_project_teams_user_2025 ON project_teams_2025_12_16_23_00(user_id);
CREATE INDEX idx_project_teams_consultant_2025 ON project_teams_2025_12_16_23_00(consultant_id);
CREATE INDEX idx_project_teams_active_2025 ON project_teams_2025_12_16_23_00(is_active);

-- فهارس التذاكر
CREATE INDEX idx_tickets_project_2025 ON tickets_2025_12_16_23_00(project_id);
CREATE INDEX idx_tickets_client_2025 ON tickets_2025_12_16_23_00(client_id);
CREATE INDEX idx_tickets_assigned_2025 ON tickets_2025_12_16_23_00(assigned_to);
CREATE INDEX idx_tickets_status_2025 ON tickets_2025_12_16_23_00(status);
CREATE INDEX idx_tickets_priority_2025 ON tickets_2025_12_16_23_00(priority);
CREATE INDEX idx_tickets_created_2025 ON tickets_2025_12_16_23_00(created_at);

-- فهارس الاجتماعات
CREATE INDEX idx_meetings_project_2025 ON meetings_2025_12_16_23_00(project_id);
CREATE INDEX idx_meetings_time_2025 ON meetings_2025_12_16_23_00(start_time, end_time);
CREATE INDEX idx_meetings_status_2025 ON meetings_2025_12_16_23_00(status);
CREATE INDEX idx_meetings_created_2025 ON meetings_2025_12_16_23_00(created_at);

-- فهارس المشاركين
CREATE INDEX idx_participants_meeting_2025 ON meeting_participants_2025_12_16_23_00(meeting_id);
CREATE INDEX idx_participants_user_2025 ON meeting_participants_2025_12_16_23_00(user_id);
CREATE INDEX idx_participants_consultant_2025 ON meeting_participants_2025_12_16_23_00(consultant_id);
CREATE INDEX idx_participants_client_2025 ON meeting_participants_2025_12_16_23_00(client_id);

-- فهارس الإشعارات
CREATE INDEX idx_notifications_recipient_2025 ON notifications_2025_12_16_23_00(recipient_id);
CREATE INDEX idx_notifications_read_2025 ON notifications_2025_12_16_23_00(is_read);
CREATE INDEX idx_notifications_created_2025 ON notifications_2025_12_16_23_00(created_at);
CREATE INDEX idx_notifications_type_2025 ON notifications_2025_12_16_23_00(type);

-- فهارس سجل الأنشطة
CREATE INDEX idx_audit_logs_user_2025 ON audit_logs_2025_12_16_23_00(user_id);
CREATE INDEX idx_audit_logs_entity_2025 ON audit_logs_2025_12_16_23_00(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_2025 ON audit_logs_2025_12_16_23_00(created_at);
CREATE INDEX idx_audit_logs_action_2025 ON audit_logs_2025_12_16_23_00(action);

-- ==========================================
-- تفعيل Row Level Security (RLS)
-- ==========================================

ALTER TABLE user_profiles_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultants_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_teams_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs_2025_12_16_23_00 ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- سياسات الأمان للمستخدمين
-- ==========================================

-- المستخدمون يمكنهم رؤية وتحديث ملفاتهم الشخصية
CREATE POLICY "users_own_profile_2025" ON user_profiles_2025_12_16_23_00
  FOR ALL USING (auth.uid() = id);

-- الإداريون يمكنهم رؤية جميع الملفات الشخصية
CREATE POLICY "admins_view_all_profiles_2025" ON user_profiles_2025_12_16_23_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ==========================================
-- سياسات الأمان للعملاء
-- ==========================================

-- المستخدمون المصرح لهم يمكنهم رؤية العملاء
CREATE POLICY "authenticated_view_clients_2025" ON clients_2025_12_16_23_00
  FOR SELECT USING (auth.role() = 'authenticated');

-- الإداريون والمديرون يمكنهم إدارة العملاء
CREATE POLICY "managers_manage_clients_2025" ON clients_2025_12_16_23_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ==========================================
-- سياسات الأمان للاستشاريين
-- ==========================================

-- المستخدمون المصرح لهم يمكنهم رؤية الاستشاريين
CREATE POLICY "authenticated_view_consultants_2025" ON consultants_2025_12_16_23_00
  FOR SELECT USING (auth.role() = 'authenticated');

-- الإداريون والمديرون يمكنهم إدارة الاستشاريين
CREATE POLICY "managers_manage_consultants_2025" ON consultants_2025_12_16_23_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- الاستشاريون يمكنهم تحديث ملفاتهم الشخصية
CREATE POLICY "consultants_own_profile_2025" ON consultants_2025_12_16_23_00
  FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- سياسات الأمان للمشاريع
-- ==========================================

-- المستخدمون يمكنهم رؤية المشاريع التي يشاركون فيها
CREATE POLICY "team_members_view_projects_2025" ON projects_2025_12_16_23_00
  FOR SELECT USING (
    project_manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_teams_2025_12_16_23_00 
      WHERE project_id = projects_2025_12_16_23_00.id 
      AND user_id = auth.uid() 
      AND is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- مديرو المشاريع والإداريون يمكنهم إدارة المشاريع
CREATE POLICY "managers_manage_projects_2025" ON projects_2025_12_16_23_00
  FOR ALL USING (
    project_manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ==========================================
-- سياسات الأمان لفرق المشاريع
-- ==========================================

-- أعضاء الفريق يمكنهم رؤية فرق مشاريعهم
CREATE POLICY "team_members_view_teams_2025" ON project_teams_2025_12_16_23_00
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects_2025_12_16_23_00 
      WHERE id = project_id AND project_manager_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- مديرو المشاريع يمكنهم إدارة فرقهم
CREATE POLICY "project_managers_manage_teams_2025" ON project_teams_2025_12_16_23_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects_2025_12_16_23_00 
      WHERE id = project_id AND project_manager_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ==========================================
-- سياسات الأمان للتذاكر
-- ==========================================

-- المستخدمون يمكنهم رؤية التذاكر المتعلقة بهم
CREATE POLICY "users_view_related_tickets_2025" ON tickets_2025_12_16_23_00
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects_2025_12_16_23_00 
      WHERE id = project_id AND (
        project_manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_teams_2025_12_16_23_00 
          WHERE project_id = projects_2025_12_16_23_00.id 
          AND user_id = auth.uid() 
          AND is_active = true
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- المستخدمون يمكنهم إنشاء تذاكر
CREATE POLICY "authenticated_create_tickets_2025" ON tickets_2025_12_16_23_00
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- المستخدمون يمكنهم تحديث التذاكر المكلفين بها
CREATE POLICY "assigned_users_update_tickets_2025" ON tickets_2025_12_16_23_00
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ==========================================
-- سياسات الأمان للاجتماعات
-- ==========================================

-- المستخدمون يمكنهم رؤية الاجتماعات التي يشاركون فيها
CREATE POLICY "participants_view_meetings_2025" ON meetings_2025_12_16_23_00
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM meeting_participants_2025_12_16_23_00 
      WHERE meeting_id = meetings_2025_12_16_23_00.id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM projects_2025_12_16_23_00 
      WHERE id = project_id AND (
        project_manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_teams_2025_12_16_23_00 
          WHERE project_id = projects_2025_12_16_23_00.id 
          AND user_id = auth.uid() 
          AND is_active = true
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- المستخدمون يمكنهم إنشاء اجتماعات
CREATE POLICY "authenticated_create_meetings_2025" ON meetings_2025_12_16_23_00
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- منشئو الاجتماعات يمكنهم إدارتها
CREATE POLICY "creators_manage_meetings_2025" ON meetings_2025_12_16_23_00
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ==========================================
-- سياسات الأمان للمشاركين في الاجتماعات
-- ==========================================

-- المستخدمون يمكنهم رؤية مشاركاتهم في الاجتماعات
CREATE POLICY "users_view_own_participation_2025" ON meeting_participants_2025_12_16_23_00
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM meetings_2025_12_16_23_00 
      WHERE id = meeting_id AND created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- منشئو الاجتماعات يمكنهم إدارة المشاركين
CREATE POLICY "meeting_creators_manage_participants_2025" ON meeting_participants_2025_12_16_23_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meetings_2025_12_16_23_00 
      WHERE id = meeting_id AND created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- ==========================================
-- سياسات الأمان للإشعارات
-- ==========================================

-- المستخدمون يمكنهم رؤية إشعاراتهم فقط
CREATE POLICY "users_own_notifications_2025" ON notifications_2025_12_16_23_00
  FOR ALL USING (recipient_id = auth.uid());

-- ==========================================
-- سياسات الأمان لسجل الأنشطة
-- ==========================================

-- الإداريون فقط يمكنهم رؤية سجل الأنشطة
CREATE POLICY "admins_view_audit_logs_2025" ON audit_logs_2025_12_16_23_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_2025_12_16_23_00 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- النظام يمكنه إدراج سجلات الأنشطة
CREATE POLICY "system_insert_audit_logs_2025" ON audit_logs_2025_12_16_23_00
  FOR INSERT WITH CHECK (true);