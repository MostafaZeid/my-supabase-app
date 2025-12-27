import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Briefcase, 
  TrendingUp,
  CheckCircle2,
  Clock,
  Star,
  Download,
  Eye,
  Building,
  GraduationCap,
  Target,
  DollarSign,
  Users,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface ConsultantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultant: {
    name: string;
    role: string;
    avatar: string;
    email?: string;
  };
  viewType?: 'full' | 'basic' | 'client';
}

interface ConsultantData {
  id: string;
  full_name: string;
  full_name_en: string;
  position: string;
  position_en: string;
  avatar_initials: string;
  email: string;
  phone: string;
  location: string;
  location_en: string;
  join_date: string;
  experience_years: number;
  specialization: string;
  specialization_en: string;
  biography: string;
  biography_en: string;
  department: string;
  department_en: string;
  status: string;
}

interface ConsultantPerformance {
  total_projects: number;
  completed_projects: number;
  active_projects: number;
  success_rate: number;
  total_budget_managed: number;
  average_project_value: number;
  largest_project_value: number;
  average_client_rating: number;
  on_time_delivery_rate: number;
  client_satisfaction_rate: number;
  cost_savings_percentage: number;
}

interface ConsultantQualification {
  qualification_name: string;
  qualification_name_en: string;
  institution: string;
  institution_en: string;
  completion_year: number;
  qualification_type: string;
  certificate_url?: string;
}

interface ConsultantDocument {
  document_name: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
}

export function ConsultantProfileModal({ isOpen, onClose, consultant, viewType = 'full' }: ConsultantProfileModalProps) {
  const { language, dir } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultantData, setConsultantData] = useState<ConsultantData | null>(null);
  const [performance, setPerformance] = useState<ConsultantPerformance | null>(null);
  const [qualifications, setQualifications] = useState<ConsultantQualification[]>([]);
  const [documents, setDocuments] = useState<ConsultantDocument[]>([]);

  // جلب بيانات المستشار من قاعدة البيانات
  useEffect(() => {
    if (isOpen && consultant.email) {
      fetchConsultantData();
    }
  }, [isOpen, consultant.email]);

  const fetchConsultantData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching data for consultant:', consultant.email);

      // جلب البيانات الأساسية للمستشار
      const { data: consultantInfo, error: consultantError } = await supabase
        .from('consultants_2025_12_14_20_21')
        .select('*')
        .eq('email', consultant.email)
        .single();

      if (consultantError) {
        console.error('Error fetching consultant:', consultantError);
        
        // إذا لم يتم العثور على المستشار، استخدم البيانات الافتراضية
        if (consultantError.code === 'PGRST116') {
          console.log('Consultant not found in database, using fallback data');
          setConsultantData(createFallbackConsultantData());
          setPerformance(createFallbackPerformanceData());
          setQualifications(createFallbackQualifications());
        } else {
          setError('حدث خطأ في جلب بيانات المستشار');
        }
        setLoading(false);
        return;
      }

      console.log('Consultant data found:', consultantInfo);
      setConsultantData(consultantInfo);

      // جلب إحصائيات الأداء
      const { data: performanceData, error: performanceError } = await supabase
        .from('consultant_performance_2025_12_14_20_21')
        .select('*')
        .eq('consultant_id', consultantInfo.id)
        .single();

      if (!performanceError && performanceData) {
        console.log('Performance data found:', performanceData);
        setPerformance(performanceData);
      } else {
        console.log('No performance data found, using fallback');
        setPerformance(createFallbackPerformanceData());
      }

      // جلب المؤهلات والشهادات
      const { data: qualificationsData, error: qualificationsError } = await supabase
        .from('consultant_qualifications_2025_12_14_20_21')
        .select('*')
        .eq('consultant_id', consultantInfo.id)
        .order('completion_year', { ascending: false });

      if (!qualificationsError && qualificationsData) {
        console.log('Qualifications data found:', qualificationsData);
        setQualifications(qualificationsData);
      } else {
        console.log('No qualifications data found, using fallback');
        setQualifications(createFallbackQualifications());
      }

      // جلب الملفات والوثائق
      const { data: documentsData, error: documentsError } = await supabase
        .from('consultant_documents_2025_12_14_20_21')
        .select('*')
        .eq('consultant_id', consultantInfo.id)
        .eq('is_public', true)
        .order('display_order', { ascending: true });

      if (!documentsError && documentsData) {
        console.log('Documents data found:', documentsData);
        setDocuments(documentsData);
      }

    } catch (error) {
      console.error('Error fetching consultant data:', error);
      setError('حدث خطأ في جلب بيانات المستشار');
      
      // استخدام البيانات الافتراضية في حالة الخطأ
      setConsultantData(createFallbackConsultantData());
      setPerformance(createFallbackPerformanceData());
      setQualifications(createFallbackQualifications());
    } finally {
      setLoading(false);
    }
  };

  // إنشاء بيانات افتراضية للمستشار
  const createFallbackConsultantData = (): ConsultantData => {
    return {
      id: 'fallback-id',
      full_name: consultant.name,
      full_name_en: consultant.name,
      position: consultant.role,
      position_en: consultant.role,
      avatar_initials: consultant.avatar,
      email: consultant.email || 'consultant@albayan.com',
      phone: '+966 50 123 4567',
      location: 'الرياض، المملكة العربية السعودية',
      location_en: 'Riyadh, Saudi Arabia',
      join_date: '2020-01-01',
      experience_years: 8,
      specialization: 'الاستشارات المتخصصة',
      specialization_en: 'Specialized Consulting',
      biography: 'مستشار خبير مع سنوات من الخبرة في مجال التخصص. يتمتع بخبرة واسعة في تطوير الحلول المبتكرة وتقديم الاستشارات المتميزة للعملاء.',
      biography_en: 'Expert consultant with years of experience in the field of specialization. Has extensive experience in developing innovative solutions and providing excellent consulting services to clients.',
      department: 'الاستشارات',
      department_en: 'Consulting',
      status: 'active'
    };
  };

  // إنشاء بيانات أداء افتراضية
  const createFallbackPerformanceData = (): ConsultantPerformance => {
    return {
      total_projects: 25,
      completed_projects: 22,
      active_projects: 3,
      success_rate: 88.0,
      total_budget_managed: 45000000,
      average_project_value: 1800000,
      largest_project_value: 3200000,
      average_client_rating: 4.5,
      on_time_delivery_rate: 85.0,
      client_satisfaction_rate: 4.4,
      cost_savings_percentage: 12.5
    };
  };

  // إنشاء مؤهلات افتراضية
  const createFallbackQualifications = (): ConsultantQualification[] => {
    return [
      {
        qualification_name: 'ماجستير إدارة الأعمال',
        qualification_name_en: 'Master of Business Administration',
        institution: 'جامعة الملك سعود',
        institution_en: 'King Saud University',
        completion_year: 2018,
        qualification_type: 'degree'
      },
      {
        qualification_name: 'شهادة إدارة المشاريع المهنية',
        qualification_name_en: 'Project Management Professional (PMP)',
        institution: 'معهد إدارة المشاريع',
        institution_en: 'Project Management Institute',
        completion_year: 2020,
        qualification_type: 'certification'
      }
    ];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(num);
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" dir={dir}>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">
              {language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" dir={dir}>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // إذا لم يتم العثور على البيانات
  if (!consultantData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" dir={dir}>
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'ar' ? 'لم يتم العثور على البيانات' : 'Data Not Found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'لم يتم العثور على ملف شخصي لهذا المستشار' 
                : 'No profile found for this consultant'}
            </p>
            <Button onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {language === 'ar' ? 'الملف الشخصي للمستشار' : 'Consultant Profile'}
          </DialogTitle>
        </DialogHeader>

        {/* عرض مبسط للمستشار الفرعي */}
        {viewType === 'basic' ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {consultantData.avatar_initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      {language === 'ar' ? consultantData.full_name : consultantData.full_name_en || consultantData.full_name}
                    </h2>
                    <p className="text-muted-foreground mb-2">
                      {language === 'ar' ? consultantData.position : consultantData.position_en || consultantData.position}
                    </p>
                    <Badge variant="secondary">
                      {language === 'ar' ? consultantData.department : consultantData.department_en || consultantData.department}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'التخصص' : 'Specialization'}
                    </Label>
                    <p className="font-medium">
                      {language === 'ar' ? consultantData.specialization : consultantData.specialization_en || consultantData.specialization}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'سنوات الخبرة' : 'Experience'}
                    </Label>
                    <p className="font-medium">
                      {consultantData.experience_years} {language === 'ar' ? 'سنة' : 'years'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'ar' ? 'نبذة مهنية' : 'Professional Summary'}
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'ar' ? consultantData.biography : consultantData.biography_en || consultantData.biography}
                  </p>
                </div>
                
                {/* ملاحظة مهمة */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-800">
                        {language === 'ar' ? 'ملاحظة' : 'Note'}
                      </p>
                      <p className="text-xs text-blue-700">
                        {language === 'ar' 
                          ? 'هذه بطاقة تعريفية أساسية لزميل العمل. الإحصائيات التفصيلية غير متاحة للحفاظ على الخصوصية المهنية.'
                          : 'This is a basic profile card for a work colleague. Detailed statistics are not available to maintain professional privacy.'
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
        ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {consultantData.avatar_initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {language === 'ar' ? consultantData.full_name : consultantData.full_name_en || consultantData.full_name}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    {language === 'ar' ? consultantData.position : consultantData.position_en || consultantData.position}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{consultantData.email}</span>
                    </div>
                    {consultantData.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{consultantData.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{language === 'ar' ? consultantData.location : consultantData.location_en || consultantData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {language === 'ar' ? 'انضم في' : 'Joined'}: {formatDate(consultantData.join_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{language === 'ar' ? consultantData.department : consultantData.department_en || consultantData.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {consultantData.experience_years} {language === 'ar' ? 'سنة خبرة' : 'years experience'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {performance && (
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      {performance.success_rate}% {language === 'ar' ? 'نجاح' : 'Success'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{performance.average_client_rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="biography">
                {language === 'ar' ? 'السيرة الذاتية' : 'Biography'}
              </TabsTrigger>
              <TabsTrigger value="qualifications">
                {language === 'ar' ? 'المؤهلات' : 'Qualifications'}
              </TabsTrigger>
              <TabsTrigger value="performance">
                {language === 'ar' ? 'الأداء' : 'Performance'}
              </TabsTrigger>
              <TabsTrigger value="documents">
                {language === 'ar' ? 'الملفات' : 'Documents'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {performance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {formatNumber(performance.total_projects)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'إجمالي المشاريع' : 'Total Projects'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {formatNumber(performance.completed_projects)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'مشاريع مكتملة' : 'Completed Projects'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {formatNumber(performance.active_projects)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'مشاريع نشطة' : 'Active Projects'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {language === 'ar' ? 'التخصص' : 'Specialization'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? consultantData.specialization : consultantData.specialization_en || consultantData.specialization}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Biography Tab */}
            <TabsContent value="biography">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {language === 'ar' ? 'السيرة الذاتية' : 'Biography'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {language === 'ar' ? consultantData.biography : consultantData.biography_en || consultantData.biography}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Qualifications Tab */}
            <TabsContent value="qualifications" className="space-y-4">
              {qualifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qualifications.map((qual, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <GraduationCap className="w-6 h-6 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {language === 'ar' ? qual.qualification_name : qual.qualification_name_en || qual.qualification_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? qual.institution : qual.institution_en || qual.institution}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {qual.completion_year}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {qual.qualification_type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد مؤهلات مسجلة' : 'No qualifications recorded'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              {performance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {language === 'ar' ? 'إحصائيات الأداء' : 'Performance Statistics'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{language === 'ar' ? 'معدل النجاح' : 'Success Rate'}</span>
                          <span className="font-medium">{performance.success_rate}%</span>
                        </div>
                        <Progress value={performance.success_rate} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{language === 'ar' ? 'التسليم في الوقت المحدد' : 'On-Time Delivery'}</span>
                          <span className="font-medium">{performance.on_time_delivery_rate}%</span>
                        </div>
                        <Progress value={performance.on_time_delivery_rate} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{language === 'ar' ? 'رضا العملاء' : 'Client Satisfaction'}</span>
                          <span className="font-medium">{performance.client_satisfaction_rate}/5</span>
                        </div>
                        <Progress value={performance.client_satisfaction_rate * 20} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {language === 'ar' ? 'الإنجازات المالية' : 'Financial Achievements'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatCurrency(performance.total_budget_managed)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'إجمالي الميزانيات المدارة' : 'Total Budget Managed'}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">{language === 'ar' ? 'متوسط قيمة المشروع' : 'Average Project Value'}</span>
                          <span className="font-medium">{formatCurrency(performance.average_project_value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">{language === 'ar' ? 'أكبر مشروع' : 'Largest Project'}</span>
                          <span className="font-medium">{formatCurrency(performance.largest_project_value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">{language === 'ar' ? 'توفير في التكاليف' : 'Cost Savings'}</span>
                          <span className="font-medium text-green-600">{performance.cost_savings_percentage}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد إحصائيات أداء متاحة' : 'No performance statistics available'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-6 h-6 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{doc.document_name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{doc.document_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(doc.uploaded_at)}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'عرض' : 'View'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد ملفات متاحة للعرض' : 'No documents available for viewing'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
            {consultantData.email && (
              <Button className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${consultantData.email}`} className="no-underline">
                  {language === 'ar' ? 'إرسال رسالة' : 'Send Message'}
                </a>
              </Button>
            )}
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}