-- ==========================================
-- Project Phases Tree System
-- ==========================================

-- Activity Status Enum
CREATE TYPE activity_status_enum AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS', 
  'DONE',
  'BLOCKED'
);

-- Project Phases Table
CREATE TABLE project_phases_tree_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  planned_start_date DATE,
  planned_end_date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Project Activities Table
CREATE TABLE project_activities_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES project_phases_tree_2025_12_16_22_00(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  planned_start_date DATE NOT NULL,
  planned_end_date DATE NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  status activity_status_enum DEFAULT 'NOT_STARTED',
  owner_user_id UUID REFERENCES auth.users(id),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for Performance
CREATE INDEX idx_phases_project_id ON project_phases_tree_2025_12_16_22_00(project_id);
CREATE INDEX idx_phases_display_order ON project_phases_tree_2025_12_16_22_00(display_order);
CREATE INDEX idx_activities_phase_id ON project_activities_2025_12_16_22_00(phase_id);
CREATE INDEX idx_activities_owner ON project_activities_2025_12_16_22_00(owner_user_id);
CREATE INDEX idx_activities_status ON project_activities_2025_12_16_22_00(status);
CREATE INDEX idx_activities_dates ON project_activities_2025_12_16_22_00(planned_start_date, planned_end_date);

-- Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_phases_updated_at 
  BEFORE UPDATE ON project_phases_tree_2025_12_16_22_00 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at 
  BEFORE UPDATE ON project_activities_2025_12_16_22_00 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- RLS Policies for Phases
-- ==========================================

ALTER TABLE project_phases_tree_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- System Admin: Full access
CREATE POLICY "system_admin_phases_all" ON project_phases_tree_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

-- Project Manager: Full access to their projects
CREATE POLICY "project_manager_phases_all" ON project_phases_tree_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

-- Project Consultant: Read-only access
CREATE POLICY "project_consultant_phases_read" ON project_phases_tree_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_consultant'
    )
  );

-- Clients: Read-only access
CREATE POLICY "clients_phases_read" ON project_phases_tree_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role IN ('main_client', 'sub_client')
    )
  );

-- ==========================================
-- RLS Policies for Activities
-- ==========================================

ALTER TABLE project_activities_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- System Admin: Full access
CREATE POLICY "system_admin_activities_all" ON project_activities_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

-- Project Manager: Full access
CREATE POLICY "project_manager_activities_all" ON project_activities_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

-- Project Consultant: Read all, update only assigned activities
CREATE POLICY "project_consultant_activities_read" ON project_activities_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_consultant'
    )
  );

CREATE POLICY "project_consultant_activities_update_assigned" ON project_activities_2025_12_16_22_00
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() 
        AND up.role = 'project_consultant'
        AND project_activities_2025_12_16_22_00.owner_user_id = auth.uid()
    )
  );

-- Clients: Read-only access
CREATE POLICY "clients_activities_read" ON project_activities_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role IN ('main_client', 'sub_client')
    )
  );

-- Comments
COMMENT ON TABLE project_phases_tree_2025_12_16_22_00 IS 'Project phases for tree-based project management system';
COMMENT ON TABLE project_activities_2025_12_16_22_00 IS 'Project activities under phases with progress tracking';
COMMENT ON COLUMN project_activities_2025_12_16_22_00.progress_percent IS 'Activity completion percentage (0-100)';
COMMENT ON COLUMN project_activities_2025_12_16_22_00.owner_user_id IS 'User assigned to this activity';