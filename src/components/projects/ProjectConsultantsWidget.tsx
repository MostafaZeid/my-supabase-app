import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users,
  Eye,
  FileText,
  Download,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Consultant {
  id: string;
  full_name: string;
  full_name_en: string;
  position: string;
  position_en: string;
  avatar_initials: string;
  email: string;
  biography: string;
  biography_en: string;
  department: string;
  department_en: string;
  profile_image?: string;
  cv_document_url?: string;
  cv_document_name?: string;
}

export function ProjectConsultantsWidget() {
  const { userProfile } = useAuth();
  const { language, dir } = useLanguage();
  
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // التحقق من إمكانية عرض المستشارين
  const canViewConsultants = () => {
    return userProfile?.role === 'main_client' || userProfile?.role === 'sub_client' || userProfile?.role === 'sub_consultant';
  };

  // جلب بيانات المستشارين
  useEffect(() => {
    if (canViewConsultants()) {
      fetchConsultants();
    }
  }, [userProfile]);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('consultants_2025_12_14_20_21')
        .select('*')
        .eq('status', 'active')
        .limit(6);

      if (error) {
        console.error('Error fetching consultants:', error);
        return;
      }

      setConsultants(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // إذا لم يكن عميل، لا تعرض المكون
  if (!canViewConsultants()) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'ar' ? 'فريق المستشارين' : 'Consultants Team'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : consultants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultants.map((consultant) => (
                <div
                  key={consultant.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedConsultant(consultant);
                    setShowViewModal(true);
                  }}
                >
                  <Avatar className="w-12 h-12">
                    {consultant.profile_image ? (
                      <AvatarImage src={consultant.profile_image} alt={consultant.full_name} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {consultant.avatar_initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {language === 'ar' ? consultant.full_name : consultant.full_name_en || consultant.full_name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {language === 'ar' ? consultant.position : consultant.position_en || consultant.position}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {language === 'ar' ? consultant.department : consultant.department_en || consultant.department}
                    </Badge>
                  </div>
                  
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا يوجد مستشارين متاحين حالياً' : 'No consultants available'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة عرض المستشار - السيرة الذاتية فقط */}
      {selectedConsultant && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {language === 'ar' ? 'ملف المستشار' : 'Consultant Profile'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  {selectedConsultant.profile_image ? (
                    <AvatarImage src={selectedConsultant.profile_image} alt={selectedConsultant.full_name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {selectedConsultant.avatar_initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {language === 'ar' ? selectedConsultant.full_name : selectedConsultant.full_name_en || selectedConsultant.full_name}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? selectedConsultant.position : selectedConsultant.position_en || selectedConsultant.position}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {language === 'ar' ? selectedConsultant.department : selectedConsultant.department_en || selectedConsultant.department}
                  </Badge>
                </div>
              </div>

              {/* السيرة الذاتية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {language === 'ar' ? 'السيرة الذاتية' : 'Biography'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === 'ar' ? selectedConsultant.biography : selectedConsultant.biography_en || selectedConsultant.biography}
                  </p>
                </CardContent>
              </Card>

              {/* مرفق السيرة الذاتية */}
              {selectedConsultant.cv_document_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {language === 'ar' ? 'مرفق السيرة الذاتية' : 'CV Document'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">
                            {selectedConsultant.cv_document_name || 'السيرة الذاتية.pdf'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ar' ? 'ملف PDF' : 'PDF Document'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedConsultant.cv_document_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'تحميل' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setShowViewModal(false)}>
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}