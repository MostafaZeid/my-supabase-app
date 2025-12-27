-- نظام التواصل والاجتماعات
-- جدول الرسائل الداخلية
CREATE TABLE IF NOT EXISTS internal_messages_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات المشروع والسياق
  project_id VARCHAR(50) REFERENCES projects_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES deliverables_advanced_2025_12_15_21_00(id) ON DELETE SET NULL,
  
  -- معلومات المرسل والمستقبل
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name VARCHAR(200),
  sender_role VARCHAR(50),
  
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(200),
  recipient_role VARCHAR(50),
  
  -- محتوى الرسالة
  subject VARCHAR(200),
  subject_en VARCHAR(200),
  message_content TEXT NOT NULL,
  message_content_en TEXT,
  
  -- نوع الرسالة
  message_type VARCHAR(50) DEFAULT 'general', 
  -- general, deliverable_review, change_request, approval_notification, etc.
  
  -- حالة الرسالة
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, read, archived
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- معلومات التوقيت
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- معلومات إضافية
  requires_response BOOLEAN DEFAULT false,
  response_deadline TIMESTAMP WITH TIME ZONE,
  parent_message_id UUID REFERENCES internal_messages_2025_12_15_21_00(id),
  
  -- معلومات التتبع
  ip_address INET,
  user_agent TEXT
);

-- جدول المحادثات الجماعية
CREATE TABLE IF NOT EXISTS group_conversations_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات المحادثة
  conversation_name VARCHAR(200) NOT NULL,
  conversation_name_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  
  -- معلومات المشروع
  project_id VARCHAR(50) REFERENCES projects_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات المنشئ
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- إعدادات المحادثة
  is_active BOOLEAN DEFAULT true,
  conversation_type VARCHAR(50) DEFAULT 'project', -- project, deliverable, general
  
  -- صلاحيات المحادثة
  allow_all_project_members BOOLEAN DEFAULT true,
  requires_approval_to_join BOOLEAN DEFAULT false
);

-- جدول أعضاء المحادثات الجماعية
CREATE TABLE IF NOT EXISTS conversation_participants_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES group_conversations_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات المشارك
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_name VARCHAR(200),
  participant_role VARCHAR(50),
  
  -- معلومات المشاركة
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_by UUID REFERENCES auth.users(id),
  
  -- حالة المشاركة
  status VARCHAR(50) DEFAULT 'active', -- active, left, removed, banned
  can_send_messages BOOLEAN DEFAULT true,
  can_add_participants BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  
  -- آخر نشاط
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(conversation_id, participant_id)
);

-- جدول رسائل المحادثات الجماعية
CREATE TABLE IF NOT EXISTS conversation_messages_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES group_conversations_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات المرسل
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name VARCHAR(200),
  sender_role VARCHAR(50),
  
  -- محتوى الرسالة
  message_content TEXT NOT NULL,
  message_content_en TEXT,
  message_type VARCHAR(50) DEFAULT 'text', -- text, file, image, notification
  
  -- معلومات الملف (إن وجد)
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size BIGINT,
  file_type VARCHAR(100),
  
  -- معلومات التوقيت
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- حالة الرسالة
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  
  -- رد على رسالة
  reply_to_message_id UUID REFERENCES conversation_messages_2025_12_15_21_00(id)
);

-- جدول الاجتماعات
CREATE TABLE IF NOT EXISTS meetings_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الاجتماع
  meeting_title VARCHAR(200) NOT NULL,
  meeting_title_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  
  -- معلومات المشروع
  project_id VARCHAR(50) REFERENCES projects_advanced_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات التوقيت
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
  
  -- معلومات المكان
  meeting_location VARCHAR(200),
  meeting_location_en VARCHAR(200),
  is_virtual BOOLEAN DEFAULT false,
  meeting_link VARCHAR(500),
  
  -- معلومات المنظم
  organizer_id UUID REFERENCES auth.users(id),
  organizer_name VARCHAR(200),
  
  -- حالة الاجتماع
  status VARCHAR(50) DEFAULT 'scheduled', 
  -- scheduled, in_progress, completed, cancelled, postponed
  
  -- معلومات إضافية
  meeting_type VARCHAR(50) DEFAULT 'project_review', 
  -- project_review, deliverable_review, planning, training, other
  
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  requires_preparation BOOLEAN DEFAULT false,
  preparation_notes TEXT,
  preparation_notes_en TEXT,
  
  -- تواريخ مهمة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- معلومات التتبع
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- جدول أجندة الاجتماعات
CREATE TABLE IF NOT EXISTS meeting_agenda_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات البند
  agenda_item_order INTEGER NOT NULL,
  agenda_title VARCHAR(200) NOT NULL,
  agenda_title_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  
  -- معلومات التوقيت
  estimated_duration_minutes INTEGER DEFAULT 10,
  actual_duration_minutes INTEGER,
  
  -- معلومات المسؤول
  presenter_id UUID REFERENCES auth.users(id),
  presenter_name VARCHAR(200),
  
  -- نوع البند
  item_type VARCHAR(50) DEFAULT 'discussion', 
  -- discussion, presentation, decision, review, other
  
  -- حالة البند
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, skipped
  
  -- ملاحظات
  notes TEXT,
  notes_en TEXT,
  
  UNIQUE(meeting_id, agenda_item_order)
);

-- جدول حضور الاجتماعات
CREATE TABLE IF NOT EXISTS meeting_attendees_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات المدعو
  attendee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attendee_name VARCHAR(200),
  attendee_role VARCHAR(50),
  attendee_email VARCHAR(255),
  
  -- معلومات الدعوة
  invitation_status VARCHAR(50) DEFAULT 'invited', 
  -- invited, accepted, declined, tentative, no_response
  
  invitation_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_received_at TIMESTAMP WITH TIME ZONE,
  
  -- معلومات الحضور
  attendance_status VARCHAR(50) DEFAULT 'pending', 
  -- pending, present, absent, late, left_early
  
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  
  -- ملاحظات
  attendance_notes TEXT,
  attendance_notes_en TEXT,
  
  -- معلومات إضافية
  is_required BOOLEAN DEFAULT true,
  can_delegate BOOLEAN DEFAULT false,
  delegate_id UUID REFERENCES auth.users(id),
  
  UNIQUE(meeting_id, attendee_id)
);

-- جدول محاضر الاجتماعات
CREATE TABLE IF NOT EXISTS meeting_minutes_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات المحضر
  minutes_title VARCHAR(200),
  minutes_title_en VARCHAR(200),
  
  -- محتوى المحضر
  summary TEXT,
  summary_en TEXT,
  detailed_notes TEXT,
  detailed_notes_en TEXT,
  
  -- معلومات كاتب المحضر
  recorded_by UUID REFERENCES auth.users(id),
  recorded_by_name VARCHAR(200),
  
  -- حالة المحضر
  status VARCHAR(50) DEFAULT 'draft', -- draft, review, approved, published
  
  -- معلومات الموافقة
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- تواريخ مهمة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- جدول قرارات الاجتماعات
CREATE TABLE IF NOT EXISTS meeting_decisions_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings_2025_12_15_21_00(id) ON DELETE CASCADE,
  minutes_id UUID REFERENCES meeting_minutes_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات القرار
  decision_title VARCHAR(200) NOT NULL,
  decision_title_en VARCHAR(200),
  decision_description TEXT NOT NULL,
  decision_description_en TEXT,
  
  -- معلومات التنفيذ
  assigned_to_id UUID REFERENCES auth.users(id),
  assigned_to_name VARCHAR(200),
  due_date DATE,
  
  -- حالة القرار
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- معلومات التتبع
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- ملاحظات التنفيذ
  implementation_notes TEXT,
  implementation_notes_en TEXT
);

-- جدول توصيات الاجتماعات
CREATE TABLE IF NOT EXISTS meeting_recommendations_2025_12_15_21_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings_2025_12_15_21_00(id) ON DELETE CASCADE,
  minutes_id UUID REFERENCES meeting_minutes_2025_12_15_21_00(id) ON DELETE CASCADE,
  
  -- معلومات التوصية
  recommendation_title VARCHAR(200) NOT NULL,
  recommendation_title_en VARCHAR(200),
  recommendation_description TEXT NOT NULL,
  recommendation_description_en TEXT,
  
  -- معلومات التنفيذ
  recommended_to_id UUID REFERENCES auth.users(id),
  recommended_to_name VARCHAR(200),
  target_date DATE,
  
  -- حالة التوصية
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, implemented
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- معلومات الاستجابة
  response_received_at TIMESTAMP WITH TIME ZONE,
  response_notes TEXT,
  response_notes_en TEXT,
  
  -- معلومات التتبع
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  implemented_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_internal_messages_project_id ON internal_messages_2025_12_15_21_00(project_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages_2025_12_15_21_00(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_id ON internal_messages_2025_12_15_21_00(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_sent_at ON internal_messages_2025_12_15_21_00(sent_at);

CREATE INDEX IF NOT EXISTS idx_group_conversations_project_id ON group_conversations_2025_12_15_21_00(project_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants_2025_12_15_21_00(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_participant_id ON conversation_participants_2025_12_15_21_00(participant_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages_2025_12_15_21_00(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender_id ON conversation_messages_2025_12_15_21_00(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sent_at ON conversation_messages_2025_12_15_21_00(sent_at);

CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings_2025_12_15_21_00(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_organizer_id ON meetings_2025_12_15_21_00(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_date ON meetings_2025_12_15_21_00(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings_2025_12_15_21_00(status);

CREATE INDEX IF NOT EXISTS idx_meeting_agenda_meeting_id ON meeting_agenda_2025_12_15_21_00(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees_2025_12_15_21_00(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_attendee_id ON meeting_attendees_2025_12_15_21_00(attendee_id);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_meeting_id ON meeting_minutes_2025_12_15_21_00(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_decisions_meeting_id ON meeting_decisions_2025_12_15_21_00(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recommendations_meeting_id ON meeting_recommendations_2025_12_15_21_00(meeting_id);

-- تعطيل RLS مؤقتاً للتطوير
ALTER TABLE internal_messages_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_conversations_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agenda_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_decisions_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recommendations_2025_12_15_21_00 DISABLE ROW LEVEL SECURITY;

-- إضافة تعليقات
COMMENT ON TABLE internal_messages_2025_12_15_21_00 IS 'نظام الرسائل الداخلية للمشاريع';
COMMENT ON TABLE group_conversations_2025_12_15_21_00 IS 'المحادثات الجماعية للمشاريع';
COMMENT ON TABLE conversation_participants_2025_12_15_21_00 IS 'أعضاء المحادثات الجماعية';
COMMENT ON TABLE conversation_messages_2025_12_15_21_00 IS 'رسائل المحادثات الجماعية';
COMMENT ON TABLE meetings_2025_12_15_21_00 IS 'إدارة الاجتماعات';
COMMENT ON TABLE meeting_agenda_2025_12_15_21_00 IS 'أجندة الاجتماعات';
COMMENT ON TABLE meeting_attendees_2025_12_15_21_00 IS 'حضور الاجتماعات';
COMMENT ON TABLE meeting_minutes_2025_12_15_21_00 IS 'محاضر الاجتماعات';
COMMENT ON TABLE meeting_decisions_2025_12_15_21_00 IS 'قرارات الاجتماعات';
COMMENT ON TABLE meeting_recommendations_2025_12_15_21_00 IS 'توصيات الاجتماعات';