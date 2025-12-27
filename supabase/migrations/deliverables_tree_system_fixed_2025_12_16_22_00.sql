-- ==========================================
-- Deliverables Tree System with Weights (Fixed)
-- ==========================================

-- Weight Unit Enum
DO $$ BEGIN
  CREATE TYPE weight_unit_enum AS ENUM ('PERCENT', 'POINTS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Deliverable Status Enum  
DO $$ BEGIN
  CREATE TYPE deliverable_status_enum AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Deliverables Tree Table (Root deliverables)
CREATE TABLE deliverables_tree_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  weight DECIMAL(10,2) NOT NULL DEFAULT 0,
  weight_unit weight_unit_enum DEFAULT 'PERCENT',
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status deliverable_status_enum DEFAULT 'NOT_STARTED',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  weighted_contribution_percent DECIMAL(5,2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_weight CHECK (weight >= 0),
  CONSTRAINT valid_weighted_contribution CHECK (weighted_contribution_percent >= 0 AND weighted_contribution_percent <= 100)
);

-- Deliverable Parts Table (Child parts under deliverables)
CREATE TABLE deliverable_parts_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES deliverables_tree_2025_12_16_22_00(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  part_weight DECIMAL(10,2),
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status deliverable_status_enum DEFAULT 'NOT_STARTED',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  assigned_user_id UUID REFERENCES auth.users(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_part_weight CHECK (part_weight IS NULL OR part_weight >= 0)
);

-- Deliverable Final Files Table
CREATE TABLE deliverable_final_files_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES deliverables_tree_2025_12_16_22_00(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_key VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT,
  content_type VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  
  -- Unique constraint: one final file per deliverable
  CONSTRAINT unique_final_file_per_deliverable UNIQUE (deliverable_id)
);

-- Deliverable Part Versions Table (File versions for parts)
CREATE TABLE deliverable_part_versions_2025_12_16_22_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES deliverable_parts_2025_12_16_22_00(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_name VARCHAR(255) NOT NULL,
  file_key VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT,
  content_type VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Unique constraint: version number per part
  CONSTRAINT unique_version_per_part UNIQUE (part_id, version_number)
);

-- Indexes for Performance (with unique names)
CREATE INDEX idx_deliverables_tree_project_id ON deliverables_tree_2025_12_16_22_00(project_id);
CREATE INDEX idx_deliverables_tree_status ON deliverables_tree_2025_12_16_22_00(status);
CREATE INDEX idx_deliverables_tree_weight ON deliverables_tree_2025_12_16_22_00(weight);
CREATE INDEX idx_deliverables_tree_display_order ON deliverables_tree_2025_12_16_22_00(display_order);

CREATE INDEX idx_deliverable_parts_deliverable_id ON deliverable_parts_2025_12_16_22_00(deliverable_id);
CREATE INDEX idx_deliverable_parts_assigned_user ON deliverable_parts_2025_12_16_22_00(assigned_user_id);
CREATE INDEX idx_deliverable_parts_status ON deliverable_parts_2025_12_16_22_00(status);
CREATE INDEX idx_deliverable_parts_display_order ON deliverable_parts_2025_12_16_22_00(display_order);

CREATE INDEX idx_deliverable_final_files_deliverable ON deliverable_final_files_2025_12_16_22_00(deliverable_id);
CREATE INDEX idx_deliverable_part_versions_part_id ON deliverable_part_versions_2025_12_16_22_00(part_id);
CREATE INDEX idx_deliverable_part_versions_version ON deliverable_part_versions_2025_12_16_22_00(part_id, version_number);

-- Updated At Triggers
CREATE TRIGGER update_deliverables_tree_updated_at 
  BEFORE UPDATE ON deliverables_tree_2025_12_16_22_00 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverable_parts_updated_at 
  BEFORE UPDATE ON deliverable_parts_2025_12_16_22_00 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- RLS Policies for Deliverables
-- ==========================================

ALTER TABLE deliverables_tree_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- System Admin: Full access
CREATE POLICY "system_admin_deliverables_tree_all" ON deliverables_tree_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

-- Project Manager: Full access
CREATE POLICY "project_manager_deliverables_tree_all" ON deliverables_tree_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

-- Project Consultant: Read all, but will be filtered by assignments
CREATE POLICY "project_consultant_deliverables_tree_read" ON deliverables_tree_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_consultant'
    )
  );

-- Main Client: Read all deliverables for their projects
CREATE POLICY "main_client_deliverables_tree_read" ON deliverables_tree_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'main_client'
    )
  );

-- Sub Client: Read only granted deliverables (will be filtered by grants)
CREATE POLICY "sub_client_deliverables_tree_read" ON deliverables_tree_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'sub_client'
    )
  );

-- ==========================================
-- RLS Policies for Deliverable Parts
-- ==========================================

ALTER TABLE deliverable_parts_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- System Admin: Full access
CREATE POLICY "system_admin_deliverable_parts_all" ON deliverable_parts_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

-- Project Manager: Full access
CREATE POLICY "project_manager_deliverable_parts_all" ON deliverable_parts_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

-- Project Consultant: Read all, update assigned parts
CREATE POLICY "project_consultant_deliverable_parts_read" ON deliverable_parts_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_consultant'
    )
  );

CREATE POLICY "project_consultant_deliverable_parts_update_assigned" ON deliverable_parts_2025_12_16_22_00
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() 
        AND up.role = 'project_consultant'
        AND deliverable_parts_2025_12_16_22_00.assigned_user_id = auth.uid()
    )
  );

-- Clients: Read access (filtered by grants for sub_client)
CREATE POLICY "clients_deliverable_parts_read" ON deliverable_parts_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role IN ('main_client', 'sub_client')
    )
  );

-- ==========================================
-- RLS Policies for Files
-- ==========================================

ALTER TABLE deliverable_final_files_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_part_versions_2025_12_16_22_00 ENABLE ROW LEVEL SECURITY;

-- Final Files Policies
CREATE POLICY "system_admin_deliverable_final_files_all" ON deliverable_final_files_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

CREATE POLICY "project_manager_deliverable_final_files_all" ON deliverable_final_files_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

CREATE POLICY "others_deliverable_final_files_read" ON deliverable_final_files_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role IN ('project_consultant', 'main_client', 'sub_client')
    )
  );

-- Part Versions Policies
CREATE POLICY "system_admin_deliverable_part_versions_all" ON deliverable_part_versions_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'system_admin'
    )
  );

CREATE POLICY "project_manager_deliverable_part_versions_all" ON deliverable_part_versions_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role = 'project_manager'
    )
  );

CREATE POLICY "consultant_deliverable_part_versions_assigned" ON deliverable_part_versions_2025_12_16_22_00
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      JOIN deliverable_parts_2025_12_16_22_00 dp ON dp.id = deliverable_part_versions_2025_12_16_22_00.part_id
      WHERE up.user_id = auth.uid() 
        AND up.role = 'project_consultant'
        AND dp.assigned_user_id = auth.uid()
    )
  );

CREATE POLICY "clients_deliverable_part_versions_read" ON deliverable_part_versions_2025_12_16_22_00
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_extended_2025_12_16_14_00 up
      WHERE up.user_id = auth.uid() AND up.role IN ('main_client', 'sub_client')
    )
  );

-- Comments
COMMENT ON TABLE deliverables_tree_2025_12_16_22_00 IS 'Root deliverables with weight-based progress calculation';
COMMENT ON TABLE deliverable_parts_2025_12_16_22_00 IS 'Deliverable parts/components with individual progress tracking';
COMMENT ON TABLE deliverable_final_files_2025_12_16_22_00 IS 'Final packaged files for completed deliverables';
COMMENT ON TABLE deliverable_part_versions_2025_12_16_22_00 IS 'Version control for deliverable part files';
COMMENT ON COLUMN deliverables_tree_2025_12_16_22_00.weight IS 'Deliverable weight for project progress calculation';
COMMENT ON COLUMN deliverables_tree_2025_12_16_22_00.weighted_contribution_percent IS 'Calculated contribution to overall project progress';