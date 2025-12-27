-- ==========================================
-- منصة السياسات والإجراءات - قاعدة البيانات الشاملة (مصححة)
-- ==========================================

-- إنشاء الـ ENUMs المطلوبة
DO $$ BEGIN
  CREATE TYPE user_role_enum_2025 AS ENUM ('ADMIN', 'MANAGER', 'CONSULTANT', 'CLIENT', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status_enum_2025 AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status_enum_2025 AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority_enum_2025 AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE meeting_status_enum_2025 AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type_enum_2025 AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- جدول الملفات الشخصية للمستخدمين
-- ==========================================
CREATE TABLE user_profiles_2025_12_16_23_00 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  department VARCHAR(100),
  position VARCHAR(100),
  role user_role_enum_2025 DEFAULT 'VIEWER',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- جدول العملاء
-- ==========================================
CREATE TABLE clients_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  company VARCHAR(255),
  address TEXT,
  website VARCHAR(255),
  contact_person VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- جدول الاستشاريين
-- ==========================================
CREATE TABLE consultants_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  specialization VARCHAR(255),
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  skills TEXT[], -- مصفوفة المهارات
  certifications TEXT[],
  availability_status VARCHAR(50) DEFAULT 'available',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- جدول المشاريع الرئيسي
-- ==========================================
CREATE TABLE projects_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients_2025_12_16_23_00(id),
  project_manager_id UUID REFERENCES auth.users(id),
  status project_status_enum_2025 DEFAULT 'PLANNING',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- جدول فرق المشاريع
-- ==========================================
CREATE TABLE project_teams_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects_2025_12_16_23_00(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  consultant_id UUID REFERENCES consultants_2025_12_16_23_00(id),
  role VARCHAR(100) NOT NULL,
  responsibilities TEXT,
  hourly_rate DECIMAL(10,2),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- التأكد من وجود مستخدم أو استشاري واحد على الأقل
  CONSTRAINT team_member_check CHECK (
    (user_id IS NOT NULL AND consultant_id IS NULL) OR 
    (user_id IS NULL AND consultant_id IS NOT NULL)
  )
);

-- ==========================================
-- جدول التذاكر
-- ==========================================
CREATE TABLE tickets_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  project_id UUID REFERENCES projects_2025_12_16_23_00(id),
  client_id UUID REFERENCES clients_2025_12_16_23_00(id),
  assigned_to UUID REFERENCES auth.users(id),
  status ticket_status_enum_2025 DEFAULT 'OPEN',
  priority ticket_priority_enum_2025 DEFAULT 'MEDIUM',
  category VARCHAR(100),
  tags TEXT[],
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- جدول الاجتماعات
-- ==========================================
CREATE TABLE meetings_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects_2025_12_16_23_00(id),
  meeting_type VARCHAR(100) DEFAULT 'general',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  meeting_url VARCHAR(500), -- للاجتماعات الافتراضية
  status meeting_status_enum_2025 DEFAULT 'SCHEDULED',
  agenda TEXT,
  notes TEXT,
  recording_url VARCHAR(500),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- جدول المشاركين في الاجتماعات
-- ==========================================
CREATE TABLE meeting_participants_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings_2025_12_16_23_00(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  consultant_id UUID REFERENCES consultants_2025_12_16_23_00(id),
  client_id UUID REFERENCES clients_2025_12_16_23_00(id),
  email VARCHAR(255), -- للمشاركين الخارجيين
  name VARCHAR(255), -- للمشاركين الخارجيين
  attendance_status VARCHAR(50) DEFAULT 'invited', -- invited, accepted, declined, attended
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- التأكد من وجود مشارك واحد على الأقل
  CONSTRAINT participant_check CHECK (
    (user_id IS NOT NULL) OR 
    (consultant_id IS NOT NULL) OR 
    (client_id IS NOT NULL) OR 
    (email IS NOT NULL AND name IS NOT NULL)
  )
);

-- ==========================================
-- جدول الإشعارات
-- ==========================================
CREATE TABLE notifications_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type_enum_2025 DEFAULT 'INFO',
  related_entity_type VARCHAR(100), -- project, ticket, meeting, etc.
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- جدول سجل الأنشطة (Audit Trail)
-- ==========================================
CREATE TABLE audit_logs_2025_12_16_23_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW, etc.
  entity_type VARCHAR(100) NOT NULL, -- project, client, ticket, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);