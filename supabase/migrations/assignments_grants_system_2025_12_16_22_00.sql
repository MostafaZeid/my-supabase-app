-- ==========================================
-- Assignments and Grants System
-- ==========================================

-- Grant Access Level Enum
CREATE TYPE grant_access_level_enum AS ENUM (
  'view',
  'comment', 
  'review',
  'approve'
);

-- Deliverable Assignments Table (for consultants)
CREATE TABLE deliverable_assignments_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES deliverables_tree_2025_12_16_22_00(id) ON DELETE CASCADE,
  part_id UUID REFERENCES deliverable_parts_2025_12_16_22_00(id) ON DELETE CASCADE,
  assignee_user_id UUID NOT NULL REFERENCES auth.users(id),
  can_upload BOOLEAN DEFAULT true,
  can_submit BOOLEAN DEFAULT true,
  can_respond BOOLEAN DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  
  -- Notification settings
  notify_in_app BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT true,
  message_to_user TEXT,
  deep_link TEXT,
  
  -- Constraints
  CONSTRAINT assignment_scope_check CHECK (
    (deliverable_id IS NOT NULL AND part_id IS NULL) OR 
    (deliverable_id IS NOT NULL AND part_id IS NOT NULL)
  )
);

-- Deliverable Access Grants Table (for clients)
CREATE TABLE deliverable_access_grants_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES deliverables_tree_2025_12_16_22_00(id) ON DELETE CASCADE,
  part_id UUID REFERENCES deliverable_parts_2025_12_16_22_00(id) ON DELETE CASCADE,
  grantee_user_id UUID NOT NULL REFERENCES auth.users(id),
  access_level grant_access_level_enum NOT NULL DEFAULT 'view',
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Notification settings
  notify_in_app BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT true,
  message_to_user TEXT,
  deep_link TEXT,
  
  -- Constraints
  CONSTRAINT grant_scope_check CHECK (
    (deliverable_id IS NOT NULL AND part_id IS NULL) OR 
    (deliverable_id IS NOT NULL AND part_id IS NOT NULL)
  )
);

-- Tree Notifications Table (for assignments and grants)
CREATE TABLE tree_notifications_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  deep_link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Related entities
  assignment_id UUID REFERENCES deliverable_assignments_2025_12_16_22_00(id),
  grant_id UUID REFERENCES deliverable_access_grants_2025_12_16_22_00(id),
  deliverable_id UUID REFERENCES deliverables_tree_2025_12_16_22_00(id),
  part_id UUID REFERENCES deliverable_parts_2025_12_16_22_00(id)
);

-- Indexes for Performance
CREATE INDEX idx_assignments_deliverable ON deliverable_assignments_2025_12_16_22_00(deliverable_id);
CREATE INDEX idx_assignments_part ON deliverable_assignments_2025_12_16_22_00(part_id);
CREATE INDEX idx_assignments_assignee ON deliverable_assignments_2025_12_16_22_00(assignee_user_id);
CREATE INDEX idx_assignments_assigned_at ON deliverable_assignments_2025_12_16_22_00(assigned_at);

CREATE INDEX idx_grants_deliverable ON deliverable_access_grants_2025_12_16_22_00(deliverable_id);
CREATE INDEX idx_grants_part ON deliverable_access_grants_2025_12_16_22_00(part_id);
CREATE INDEX idx_grants_grantee ON deliverable_access_grants_2025_12_16_22_00(grantee_user_id);
CREATE INDEX idx_grants_access_level ON deliverable_access_grants_2025_12_16_22_00(access_level);
CREATE INDEX idx_grants_expires_at ON deliverable_access_grants_2025_12_16_22_00(expires_at);

CREATE INDEX idx_tree_notifications_user ON tree_notifications_2025_12_16_22_00(user_id);
CREATE INDEX idx_tree_notifications_type ON tree_notifications_2025_12_16_22_00(type);
CREATE INDEX idx_tree_notifications_read ON tree_notifications_2025_12_16_22_00(is_read);
CREATE INDEX idx_tree_notifications_created_at ON tree_notifications_2025_12_16_22_00(created_at);

-- ==========================================
-- RLS Policies for Assignments
-- ==========================================

ALTER TABLE deliverable_assignments_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- System Admin: Full access
CREATE POLICY "system_admin_assignments_all" ON deliverable_assignments_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

-- Project Manager: Full access
CREATE POLICY "project_manager_assignments_all" ON deliverable_assignments_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

-- Users can see their own assignments
CREATE POLICY "users_own_assignments_read" ON deliverable_assignments_2025_12_16_22_00
  FOR SELECT USING (assignee_user_id = auth.uid());

-- ==========================================
-- RLS Policies for Grants
-- ==========================================

ALTER TABLE deliverable_access_grants_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- System Admin: Full access
CREATE POLICY "system_admin_grants_all" ON deliverable_access_grants_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

-- Project Manager: Full access
CREATE POLICY "project_manager_grants_all" ON deliverable_access_grants_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

-- Main Client: Can create and manage grants
CREATE POLICY "main_client_grants_manage" ON deliverable_access_grants_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'main_client'
    )
  );

-- Users can see grants given to them
CREATE POLICY "users_own_grants_read" ON deliverable_access_grants_2025_12_16_22_00
  FOR SELECT USING (grantee_user_id = auth.uid());

-- ==========================================
-- RLS Policies for Tree Notifications
-- ==========================================

ALTER TABLE tree_notifications_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "users_own_tree_notifications" ON tree_notifications_2025_12_16_22_00
  FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- Functions for Automatic Notifications
-- ==========================================

-- Function to create assignment notification
CREATE OR REPLACE FUNCTION create_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tree_notifications_2025_12_16_22_00 (
    user_id,
    type,
    title,
    body,
    deep_link,
    assignment_id,
    deliverable_id,
    part_id
  ) VALUES (
    NEW.assignee_user_id,
    'ASSIGNED_TO_DELIVERABLE',
    CASE 
      WHEN NEW.part_id IS NOT NULL THEN 'تم تكليفك بجزء من مخرج'
      ELSE 'تم تكليفك بمخرج جديد'
    END,
    COALESCE(NEW.message_to_user, 'لديك تكليف جديد يتطلب انتباهك'),
    NEW.deep_link,
    NEW.id,
    NEW.deliverable_id,
    NEW.part_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create grant notification
CREATE OR REPLACE FUNCTION create_grant_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tree_notifications_2025_12_16_22_00 (
    user_id,
    type,
    title,
    body,
    deep_link,
    grant_id,
    deliverable_id,
    part_id
  ) VALUES (
    NEW.grantee_user_id,
    'GRANT_CREATED',
    CASE 
      WHEN NEW.part_id IS NOT NULL THEN 'تم منحك وصول لجزء من مخرج'
      ELSE 'تم منحك وصول لمخرج جديد'
    END,
    COALESCE(NEW.message_to_user, 'تم منحك صلاحية وصول جديدة'),
    NEW.deep_link,
    NEW.id,
    NEW.deliverable_id,
    NEW.part_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic notifications
CREATE TRIGGER assignment_notification_trigger
  AFTER INSERT ON deliverable_assignments_2025_12_16_22_00
  FOR EACH ROW
  WHEN (NEW.notify_in_app = true)
  EXECUTE FUNCTION create_assignment_notification();

CREATE TRIGGER grant_notification_trigger
  AFTER INSERT ON deliverable_access_grants_2025_12_16_22_00
  FOR EACH ROW
  WHEN (NEW.notify_in_app = true)
  EXECUTE FUNCTION create_grant_notification();

-- Comments
COMMENT ON TABLE deliverable_assignments_2025_12_16_22_00 IS 'Consultant assignments to deliverables or specific parts';
COMMENT ON TABLE deliverable_access_grants_2025_12_16_22_00 IS 'Client access grants to deliverables or specific parts';
COMMENT ON TABLE tree_notifications_2025_12_16_22_00 IS 'Notifications for assignments, grants, and tree-related events';
COMMENT ON COLUMN deliverable_assignments_2025_12_16_22_00.part_id IS 'If set, assignment is scoped to this specific part only';
COMMENT ON COLUMN deliverable_access_grants_2025_12_16_22_00.part_id IS 'If set, grant is scoped to this specific part only';
COMMENT ON COLUMN deliverable_access_grants_2025_12_16_22_00.expires_at IS 'Optional expiration date for the grant';