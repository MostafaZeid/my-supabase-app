-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS public.clients_2025_12_17_00_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT,
    company_en TEXT,
    address TEXT,
    address_en TEXT,
    contact_person TEXT,
    contact_person_en TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    client_type TEXT DEFAULT 'main_client' CHECK (client_type IN ('main_client', 'sub_client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المشاريع
CREATE TABLE IF NOT EXISTS public.projects_2025_12_17_00_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    description_en TEXT,
    client_id UUID REFERENCES public.clients_2025_12_17_00_00(id),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    project_manager TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول التذاكر
CREATE TABLE IF NOT EXISTS public.tickets_2025_12_17_00_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT DEFAULT 'general' CHECK (category IN ('technical', 'billing', 'general', 'feature_request', 'bug_report')),
    client_id UUID REFERENCES public.clients_2025_12_17_00_00(id),
    project_id UUID REFERENCES public.projects_2025_12_17_00_00(id),
    assigned_to TEXT,
    reporter_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الاجتماعات
CREATE TABLE IF NOT EXISTS public.meetings_2025_12_17_00_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    meeting_url TEXT,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    organizer TEXT,
    participants JSONB DEFAULT '[]',
    agenda JSONB DEFAULT '[]',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستشارين
CREATE TABLE IF NOT EXISTS public.consultants_2025_12_17_00_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    full_name_en TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    position TEXT NOT NULL,
    position_en TEXT,
    department TEXT,
    department_en TEXT,
    specialization TEXT,
    specialization_en TEXT,
    experience_years INTEGER DEFAULT 0,
    biography TEXT,
    biography_en TEXT,
    location TEXT,
    location_en TEXT,
    consultant_code TEXT UNIQUE,
    profile_image TEXT,
    cv_document_url TEXT,
    cv_document_name TEXT,
    avatar_initials TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإشعارات والتقارير
CREATE TABLE IF NOT EXISTS public.notifications_reports_2025_12_17_00_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('notification', 'report', 'alert')),
    title TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    user_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج بيانات تجريبية للعملاء
INSERT INTO public.clients_2025_12_17_00_00 (name, name_en, email, phone, company, company_en, contact_person, contact_person_en, status, client_type) VALUES
('شركة التقنية المتقدمة', 'Advanced Technology Company', 'info@advtech.sa', '+966501234567', 'شركة التقنية المتقدمة', 'Advanced Technology Company', 'أحمد محمد', 'Ahmed Mohammed', 'active', 'main_client'),
('مؤسسة الابتكار الرقمي', 'Digital Innovation Foundation', 'contact@digiinno.com', '+966502345678', 'مؤسسة الابتكار الرقمي', 'Digital Innovation Foundation', 'فاطمة أحمد', 'Fatima Ahmed', 'active', 'main_client'),
('شركة الحلول الذكية', 'Smart Solutions Company', 'hello@smartsol.sa', '+966503456789', 'شركة الحلول الذكية', 'Smart Solutions Company', 'محمد علي', 'Mohammed Ali', 'active', 'sub_client');

-- إدراج بيانات تجريبية للمشاريع
INSERT INTO public.projects_2025_12_17_00_00 (name, name_en, description, description_en, client_id, status, priority, start_date, end_date, budget, progress, project_manager) 
SELECT 
    'مشروع تطوير نظام إدارة المحتوى',
    'Content Management System Development',
    'تطوير نظام شامل لإدارة المحتوى الرقمي',
    'Comprehensive digital content management system development',
    c.id,
    'active',
    'high',
    '2024-01-15',
    '2024-06-30',
    150000.00,
    65,
    'سارة أحمد'
FROM public.clients_2025_12_17_00_00 c LIMIT 1;

INSERT INTO public.projects_2025_12_17_00_00 (name, name_en, description, description_en, client_id, status, priority, start_date, end_date, budget, progress, project_manager) 
SELECT 
    'مشروع تطبيق الهاتف المحمول',
    'Mobile Application Project',
    'تطوير تطبيق متقدم للهواتف الذكية',
    'Advanced smartphone application development',
    c.id,
    'planning',
    'medium',
    '2024-03-01',
    '2024-08-15',
    200000.00,
    25,
    'خالد محمد'
FROM public.clients_2025_12_17_00_00 c OFFSET 1 LIMIT 1;

-- إدراج بيانات تجريبية للتذاكر
INSERT INTO public.tickets_2025_12_17_00_00 (title, description, status, priority, category, client_id, reporter_email) 
SELECT 
    'مشكلة في تسجيل الدخول',
    'المستخدم لا يستطيع تسجيل الدخول إلى النظام',
    'open',
    'high',
    'technical',
    c.id,
    'user@example.com'
FROM public.clients_2025_12_17_00_00 c LIMIT 1;

-- إدراج بيانات تجريبية للاجتماعات
INSERT INTO public.meetings_2025_12_17_00_00 (title, description, start_time, end_time, location, status, organizer, participants) VALUES
('اجتماع مراجعة المشروع الأسبوعي', 'مراجعة تقدم المشروع والمهام المنجزة', '2024-12-20 10:00:00+03', '2024-12-20 11:00:00+03', 'قاعة الاجتماعات الرئيسية', 'SCHEDULED', 'مدير المشروع', '["أحمد محمد", "فاطمة أحمد", "محمد علي"]'),
('اجتماع العصف الذهني للميزات الجديدة', 'مناقشة الأفكار الجديدة للمشروع', '2024-12-22 14:00:00+03', '2024-12-22 15:30:00+03', 'https://meet.google.com/abc-defg-hij', 'SCHEDULED', 'مدير التطوير', '["سارة أحمد", "خالد محمد"]');

-- إدراج بيانات تجريبية للمستشارين
INSERT INTO public.consultants_2025_12_17_00_00 (full_name, full_name_en, email, phone, position, position_en, department, department_en, specialization, specialization_en, experience_years, biography, biography_en, consultant_code, avatar_initials) VALUES
('د. أحمد محمد الأحمد', 'Dr. Ahmed Mohammed Al-Ahmed', 'ahmed.ahmed@company.com', '+966501111111', 'مستشار أول تقنية المعلومات', 'Senior IT Consultant', 'قسم التقنية', 'Technology Department', 'أمن المعلومات والشبكات', 'Information Security & Networks', 15, 'خبير في أمن المعلومات مع أكثر من 15 عاماً من الخبرة', 'Information security expert with over 15 years of experience', 'CON001', 'أأ'),
('م. فاطمة علي السالم', 'Eng. Fatima Ali Al-Salem', 'fatima.salem@company.com', '+966502222222', 'مستشارة إدارة المشاريع', 'Project Management Consultant', 'قسم إدارة المشاريع', 'Project Management Department', 'إدارة المشاريع التقنية', 'Technical Project Management', 12, 'مختصة في إدارة المشاريع التقنية الكبيرة', 'Specialist in large-scale technical project management', 'CON002', 'فس');

-- إدراج بيانات تجريبية للإشعارات
INSERT INTO public.notifications_reports_2025_12_17_00_00 (type, title, message, status, priority, metadata) VALUES
('notification', 'مرحباً بك في المنصة', 'تم إعداد حسابك بنجاح ويمكنك الآن استخدام جميع الميزات', 'unread', 'medium', '{"category": "welcome"}'),
('alert', 'تحديث النظام', 'سيتم تحديث النظام غداً من الساعة 2:00 إلى 4:00 صباحاً', 'unread', 'high', '{"maintenance": true}'),
('report', 'تقرير الأداء الشهري', 'تم إنجاز 85% من المهام المخططة لهذا الشهر', 'read', 'medium', '{"performance": 85}');

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients_2025_12_17_00_00(email);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects_2025_12_17_00_00(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects_2025_12_17_00_00(status);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON public.tickets_2025_12_17_00_00(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets_2025_12_17_00_00(status);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON public.meetings_2025_12_17_00_00(start_time);
CREATE INDEX IF NOT EXISTS idx_consultants_email ON public.consultants_2025_12_17_00_00(email);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications_reports_2025_12_17_00_00(type);

-- إنشاء سياسات الأمان (RLS)
ALTER TABLE public.clients_2025_12_17_00_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_2025_12_17_00_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_2025_12_17_00_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings_2025_12_17_00_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultants_2025_12_17_00_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_reports_2025_12_17_00_00 ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول للمستخدمين المصادق عليهم
CREATE POLICY "Allow authenticated users to view clients" ON public.clients_2025_12_17_00_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert clients" ON public.clients_2025_12_17_00_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update clients" ON public.clients_2025_12_17_00_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete clients" ON public.clients_2025_12_17_00_00 FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view projects" ON public.projects_2025_12_17_00_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert projects" ON public.projects_2025_12_17_00_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update projects" ON public.projects_2025_12_17_00_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete projects" ON public.projects_2025_12_17_00_00 FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view tickets" ON public.tickets_2025_12_17_00_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert tickets" ON public.tickets_2025_12_17_00_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update tickets" ON public.tickets_2025_12_17_00_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete tickets" ON public.tickets_2025_12_17_00_00 FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view meetings" ON public.meetings_2025_12_17_00_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert meetings" ON public.meetings_2025_12_17_00_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update meetings" ON public.meetings_2025_12_17_00_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete meetings" ON public.meetings_2025_12_17_00_00 FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view consultants" ON public.consultants_2025_12_17_00_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert consultants" ON public.consultants_2025_12_17_00_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update consultants" ON public.consultants_2025_12_17_00_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete consultants" ON public.consultants_2025_12_17_00_00 FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view notifications" ON public.notifications_reports_2025_12_17_00_00 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert notifications" ON public.notifications_reports_2025_12_17_00_00 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update notifications" ON public.notifications_reports_2025_12_17_00_00 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete notifications" ON public.notifications_reports_2025_12_17_00_00 FOR DELETE USING (auth.role() = 'authenticated');