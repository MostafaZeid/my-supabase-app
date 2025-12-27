-- جدول المستشارين الأساسي
CREATE TABLE IF NOT EXISTS public.consultants_2025_12_14_20_21 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- المعلومات الأساسية
    full_name VARCHAR(255) NOT NULL,
    full_name_en VARCHAR(255),
    position VARCHAR(255) NOT NULL,
    position_en VARCHAR(255),
    avatar_initials VARCHAR(10) NOT NULL,
    
    -- معلومات الاتصال
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    location_en VARCHAR(255),
    
    -- المعلومات المهنية
    join_date DATE DEFAULT CURRENT_DATE,
    experience_years INTEGER DEFAULT 0,
    specialization TEXT,
    specialization_en TEXT,
    
    -- السيرة الذاتية
    biography TEXT,
    biography_en TEXT,
    
    -- الحالة
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, on_leave
    employee_id VARCHAR(50) UNIQUE,
    
    -- معلومات إضافية
    department VARCHAR(255),
    department_en VARCHAR(255),
    manager_id UUID REFERENCES public.consultants_2025_12_14_20_21(id),
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المؤهلات والشهادات
CREATE TABLE IF NOT EXISTS public.consultant_qualifications_2025_12_14_20_21 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultant_id UUID REFERENCES public.consultants_2025_12_14_20_21(id) ON DELETE CASCADE,
    
    qualification_name VARCHAR(255) NOT NULL,
    qualification_name_en VARCHAR(255),
    institution VARCHAR(255) NOT NULL,
    institution_en VARCHAR(255),
    completion_year INTEGER,
    certificate_url TEXT, -- رابط الشهادة المرفوعة
    
    qualification_type VARCHAR(100), -- degree, certification, course, etc.
    is_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المهارات والخبرات
CREATE TABLE IF NOT EXISTS public.consultant_skills_2025_12_14_20_21 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultant_id UUID REFERENCES public.consultants_2025_12_14_20_21(id) ON DELETE CASCADE,
    
    skill_name VARCHAR(255) NOT NULL,
    skill_name_en VARCHAR(255),
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5), -- 1-5 scale
    years_of_experience INTEGER DEFAULT 0,
    
    skill_category VARCHAR(100), -- technical, soft_skills, industry_knowledge, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إحصائيات الأداء (محسوبة تلقائياً)
CREATE TABLE IF NOT EXISTS public.consultant_performance_2025_12_14_20_21 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultant_id UUID REFERENCES public.consultants_2025_12_14_20_21(id) ON DELETE CASCADE,
    
    -- إحصائيات المشاريع
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- إحصائيات مالية
    total_budget_managed DECIMAL(15,2) DEFAULT 0.00,
    average_project_value DECIMAL(15,2) DEFAULT 0.00,
    largest_project_value DECIMAL(15,2) DEFAULT 0.00,
    
    -- إحصائيات الجودة
    average_client_rating DECIMAL(3,2) DEFAULT 0.00,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0.00,
    client_satisfaction_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- إحصائيات التوفير
    cost_savings_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_savings_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- آخر تحديث للإحصائيات
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الملفات المرفوعة للمستشار
CREATE TABLE IF NOT EXISTS public.consultant_documents_2025_12_14_20_21 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultant_id UUID REFERENCES public.consultants_2025_12_14_20_21(id) ON DELETE CASCADE,
    
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100), -- cv, certificate, portfolio, etc.
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    is_public BOOLEAN DEFAULT FALSE, -- هل يمكن للعملاء رؤيته؟
    display_order INTEGER DEFAULT 0,
    
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_consultants_user_id ON public.consultants_2025_12_14_20_21(user_id);
CREATE INDEX IF NOT EXISTS idx_consultants_email ON public.consultants_2025_12_14_20_21(email);
CREATE INDEX IF NOT EXISTS idx_consultants_status ON public.consultants_2025_12_14_20_21(status);
CREATE INDEX IF NOT EXISTS idx_consultant_qualifications_consultant_id ON public.consultant_qualifications_2025_12_14_20_21(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_skills_consultant_id ON public.consultant_skills_2025_12_14_20_21(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_performance_consultant_id ON public.consultant_performance_2025_12_14_20_21(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_documents_consultant_id ON public.consultant_documents_2025_12_14_20_21(consultant_id);

-- إنشاء دالة لتحديث الإحصائيات تلقائياً
CREATE OR REPLACE FUNCTION update_consultant_performance_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- هذه الدالة ستحدث الإحصائيات عند تغيير حالة المشاريع
    -- سيتم تطويرها لاحقاً لحساب الإحصائيات من جداول المشاريع الفعلية
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة triggers لتحديث updated_at
CREATE TRIGGER update_consultants_updated_at 
    BEFORE UPDATE ON public.consultants_2025_12_14_20_21
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_performance_updated_at 
    BEFORE UPDATE ON public.consultant_performance_2025_12_14_20_21
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج بيانات تجريبية للمستشارين الموجودين
INSERT INTO public.consultants_2025_12_14_20_21 (
    full_name, full_name_en, position, position_en, avatar_initials, email, phone, location, location_en,
    experience_years, specialization, specialization_en, biography, biography_en, department, department_en
) VALUES 
(
    'د. فهد السعدي', 'Dr. Fahad Al-Saadi', 
    'مستشار أول الموارد البشرية', 'Senior HR Consultant',
    'FS', 'fahad.alsaadi@albayan.com', '+966 50 123 4567',
    'الرياض، المملكة العربية السعودية', 'Riyadh, Saudi Arabia',
    12, 'إدارة الموارد البشرية والتطوير التنظيمي', 'Human Resources Management and Organizational Development',
    'خبير في إدارة الموارد البشرية مع أكثر من 12 عاماً من الخبرة في تطوير الاستراتيجيات والسياسات. حاصل على دكتوراه في إدارة الأعمال وشهادات مهنية متقدمة.',
    'Expert in Human Resources Management with over 12 years of experience in developing strategies and policies. Holds a PhD in Business Administration and advanced professional certifications.',
    'الموارد البشرية', 'Human Resources'
),
(
    'محمد رشاد', 'Mohammed Rashad',
    'مستشار أول المالية', 'Senior Financial Consultant', 
    'MR', 'mohammed.rashad@albayan.com', '+966 50 234 5678',
    'الرياض، المملكة العربية السعودية', 'Riyadh, Saudi Arabia',
    10, 'الاستشارات المالية وإدارة المخاطر', 'Financial Consulting and Risk Management',
    'مستشار مالي خبير متخصص في التحليل المالي وإدارة المخاطر. حاصل على ماجستير المالية وشهادة CFA.',
    'Expert financial consultant specializing in financial analysis and risk management. Holds Masters in Finance and CFA certification.',
    'المالية', 'Finance'
),
(
    'محمد جودة', 'Mohammed Joudah',
    'مستشار أول الحوكمة', 'Senior Governance Consultant',
    'MJ', 'mohammed.joudah@albayan.com', '+966 50 345 6789', 
    'الرياض، المملكة العربية السعودية', 'Riyadh, Saudi Arabia',
    8, 'حوكمة الشركات والامتثال', 'Corporate Governance and Compliance',
    'خبير في حوكمة الشركات والامتثال التنظيمي مع خبرة واسعة في القطاعين العام والخاص.',
    'Expert in corporate governance and regulatory compliance with extensive experience in both public and private sectors.',
    'الحوكمة والامتثال', 'Governance & Compliance'
),
(
    'مروة الحمامصي', 'Marwa Al-Hamamsi',
    'مستشارة أول الأمن السيبراني', 'Senior Cybersecurity Consultant',
    'MH', 'marwa.alhamamsi@albayan.com', '+966 50 456 7890',
    'الرياض، المملكة العربية السعودية', 'Riyadh, Saudi Arabia', 
    9, 'الأمن السيبراني وأمن المعلومات', 'Cybersecurity and Information Security',
    'خبيرة في الأمن السيبراني وحماية المعلومات مع شهادات دولية متقدمة في أمن الشبكات.',
    'Expert in cybersecurity and information protection with advanced international certifications in network security.',
    'تقنية المعلومات', 'Information Technology'
);

-- إدراج المؤهلات التجريبية
INSERT INTO public.consultant_qualifications_2025_12_14_20_21 (
    consultant_id, qualification_name, qualification_name_en, institution, institution_en, completion_year, qualification_type
) 
SELECT 
    c.id,
    'ماجستير إدارة الأعمال',
    'Master of Business Administration',
    'جامعة الملك سعود',
    'King Saud University',
    2018,
    'degree'
FROM public.consultants_2025_12_14_20_21 c
WHERE c.email = 'fahad.alsaadi@albayan.com'

UNION ALL

SELECT 
    c.id,
    'شهادة PMP',
    'Project Management Professional',
    'معهد إدارة المشاريع',
    'Project Management Institute',
    2019,
    'certification'
FROM public.consultants_2025_12_14_20_21 c
WHERE c.email = 'mohammed.rashad@albayan.com'

UNION ALL

SELECT 
    c.id,
    'شهادة CFA المستوى الثاني',
    'CFA Level II',
    'معهد المحللين الماليين',
    'CFA Institute',
    2020,
    'certification'
FROM public.consultants_2025_12_14_20_21 c
WHERE c.email = 'mohammed.joudah@albayan.com';

-- إدراج إحصائيات الأداء التجريبية
INSERT INTO public.consultant_performance_2025_12_14_20_21 (
    consultant_id, total_projects, completed_projects, active_projects, success_rate,
    total_budget_managed, average_project_value, largest_project_value,
    average_client_rating, on_time_delivery_rate, client_satisfaction_rate,
    cost_savings_percentage
)
SELECT 
    c.id,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 52
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 48
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 35
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 28
    END as total_projects,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 48
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 44
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 33
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 25
    END as completed_projects,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 4
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 4
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 2
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 3
    END as active_projects,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 96.2
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 94.8
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 97.1
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 92.9
    END as success_rate,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 125000000.00
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 98000000.00
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 75000000.00
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 62000000.00
    END as total_budget_managed,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 2400000.00
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 2040000.00
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 2140000.00
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 2210000.00
    END as average_project_value,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 4100000.00
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 3800000.00
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 3200000.00
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 3500000.00
    END as largest_project_value,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 4.7
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 4.6
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 4.8
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 4.5
    END as average_client_rating,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 94.5
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 92.3
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 96.8
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 89.7
    END as on_time_delivery_rate,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 4.8
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 4.6
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 4.9
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 4.4
    END as client_satisfaction_rate,
    CASE 
        WHEN c.email = 'fahad.alsaadi@albayan.com' THEN 15.2
        WHEN c.email = 'mohammed.rashad@albayan.com' THEN 12.8
        WHEN c.email = 'mohammed.joudah@albayan.com' THEN 18.5
        WHEN c.email = 'marwa.alhamamsi@albayan.com' THEN 14.3
    END as cost_savings_percentage
FROM public.consultants_2025_12_14_20_21 c;

-- إنشاء سياسات الأمان (RLS)
ALTER TABLE public.consultants_2025_12_14_20_21 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_qualifications_2025_12_14_20_21 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_skills_2025_12_14_20_21 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_performance_2025_12_14_20_21 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_documents_2025_12_14_20_21 ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة - يمكن للجميع قراءة البيانات العامة
CREATE POLICY "Allow read access to consultants" ON public.consultants_2025_12_14_20_21
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to qualifications" ON public.consultant_qualifications_2025_12_14_20_21
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to skills" ON public.consultant_skills_2025_12_14_20_21
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to performance" ON public.consultant_performance_2025_12_14_20_21
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to public documents" ON public.consultant_documents_2025_12_14_20_21
    FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

-- سياسات للتعديل - فقط المستشار نفسه أو الإدارة
CREATE POLICY "Allow consultants to update own data" ON public.consultants_2025_12_14_20_21
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow consultants to manage own qualifications" ON public.consultant_qualifications_2025_12_14_20_21
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.consultants_2025_12_14_20_21 c 
            WHERE c.id = consultant_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow consultants to manage own skills" ON public.consultant_skills_2025_12_14_20_21
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.consultants_2025_12_14_20_21 c 
            WHERE c.id = consultant_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow consultants to manage own documents" ON public.consultant_documents_2025_12_14_20_21
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.consultants_2025_12_14_20_21 c 
            WHERE c.id = consultant_id AND c.user_id = auth.uid()
        )
    );