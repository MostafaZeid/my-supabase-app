import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { 
  User,
  Award,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimpleConsultantCardProps {
  isOpen: boolean;
  onClose: () => void;
  consultant: {
    name: string;
    role: string;
    avatar: string;
    email?: string;
  };
}

export function SimpleConsultantCard({ isOpen, onClose, consultant }: SimpleConsultantCardProps) {
  const { language, dir } = useLanguage();

  // بيانات المستشارين المحددة مسبقاً (في التطبيق الحقيقي ستأتي من قاعدة البيانات)
  const consultantDetails: Record<string, any> = {
    'fahad.alsaadi@albayan.com': {
      full_name: 'د. فهد السعدي',
      full_name_en: 'Dr. Fahad Al-Saadi',
      position: 'المستشار الرئيسي',
      position_en: 'Lead Consultant',
      department: 'الاستشارات الإدارية',
      department_en: 'Management Consulting',
      specialization: 'إدارة المشاريع والتطوير التنظيمي',
      specialization_en: 'Project Management & Organizational Development',
      experience_years: 15,
      biography: 'خبير في إدارة المشاريع والتطوير التنظيمي مع أكثر من 15 عاماً من الخبرة في القطاعين العام والخاص.',
      biography_en: 'Expert in project management and organizational development with over 15 years of experience in public and private sectors.'
    },
    'mohammed.rashad@albayan.com': {
      full_name: 'محمد رشاد',
      full_name_en: 'Mohammed Rashad',
      position: 'مستشار أول',
      position_en: 'Senior Consultant',
      department: 'الاستشارات المالية',
      department_en: 'Financial Consulting',
      specialization: 'التخطيط المالي والاستراتيجي',
      specialization_en: 'Financial & Strategic Planning',
      experience_years: 12,
      biography: 'متخصص في التخطيط المالي والاستراتيجي مع خبرة واسعة في تحليل الأسواق المالية.',
      biography_en: 'Specialist in financial and strategic planning with extensive experience in financial market analysis.'
    },
    'mohammed.joudah@albayan.com': {
      full_name: 'محمد جودة',
      full_name_en: 'Mohammed Joudah',
      position: 'مستشار تقني',
      position_en: 'Technical Consultant',
      department: 'الاستشارات التقنية',
      department_en: 'Technical Consulting',
      specialization: 'تطوير الأنظمة والتحول الرقمي',
      specialization_en: 'Systems Development & Digital Transformation',
      experience_years: 10,
      biography: 'خبير في تطوير الأنظمة والتحول الرقمي مع تركيز على الحلول التقنية المبتكرة.',
      biography_en: 'Expert in systems development and digital transformation with focus on innovative technical solutions.'
    },
    'marwa.alhamamsi@albayan.com': {
      full_name: 'مروة الحمامصي',
      full_name_en: 'Marwa Al-Hamamsi',
      position: 'مستشارة الموارد البشرية',
      position_en: 'HR Consultant',
      department: 'الموارد البشرية',
      department_en: 'Human Resources',
      specialization: 'تطوير المواهب والتدريب',
      specialization_en: 'Talent Development & Training',
      experience_years: 8,
      biography: 'متخصصة في تطوير المواهب والتدريب مع خبرة في بناء استراتيجيات الموارد البشرية.',
      biography_en: 'Specialist in talent development and training with experience in building HR strategies.'
    }
  };

  const details = consultantDetails[consultant.email || ''] || {
    full_name: consultant.name,
    full_name_en: consultant.name,
    position: consultant.role,
    position_en: consultant.role,
    department: 'غير محدد',
    department_en: 'Not specified',
    specialization: 'غير محدد',
    specialization_en: 'Not specified',
    experience_years: 0,
    biography: 'لا توجد معلومات متاحة',
    biography_en: 'No information available'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {language === 'ar' ? 'بطاقة تعريفية - شريك المشروع' : 'Profile Card - Project Partner'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {consultant.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {language === 'ar' ? details.full_name : details.full_name_en}
              </h2>
              <p className="text-muted-foreground">
                {language === 'ar' ? details.position : details.position_en}
              </p>
              <Badge variant="secondary" className="mt-1">
                {language === 'ar' ? details.department : details.department_en}
              </Badge>
            </div>
          </div>

          {/* بطاقة تعريفية بسيطة - بدون إحصائيات أداء */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === 'ar' ? 'المعلومات المهنية' : 'Professional Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </Label>
                  <p className="font-medium">
                    {language === 'ar' ? details.full_name : details.full_name_en}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'المنصب' : 'Position'}
                  </Label>
                  <p className="font-medium">
                    {language === 'ar' ? details.position : details.position_en}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'التخصص' : 'Specialization'}
                  </Label>
                  <p className="font-medium">
                    {language === 'ar' ? details.specialization : details.specialization_en}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'القسم' : 'Department'}
                  </Label>
                  <p className="font-medium">
                    {language === 'ar' ? details.department : details.department_en}
                  </p>
                </div>

                {details.experience_years > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                    </Label>
                    <p className="font-medium">
                      {details.experience_years} {language === 'ar' ? 'سنة' : 'years'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'ar' ? 'نبذة مهنية' : 'Professional Summary'}
                </Label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'ar' ? details.biography : details.biography_en}
                </p>
              </div>
              
              {/* ملاحظة مهمة */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">
                      {language === 'ar' ? 'ملاحظة' : 'Note'}
                    </p>
                    <p className="text-xs text-blue-700">
                      {language === 'ar' 
                        ? 'هذه بطاقة تعريفية أساسية لشريك المشروع. الإحصائيات التفصيلية غير متاحة للحفاظ على الخصوصية المهنية.'
                        : 'This is a basic profile card for a project partner. Detailed statistics are not available to maintain professional privacy.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}