import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Save, 
  Users, 
  UserPlus, 
  Trash2, 
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  X,
  Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Consultant {
  id: string;
  full_name: string;
  full_name_en: string;
  email: string;
  position: string;
  position_en: string;
  department: string;
  department_en: string;
  specialization: string;
  specialization_en: string;
  avatar_initials: string;
  profile_image?: string;
  consultant_code: string;
}

interface TeamMember {
  id: string;
  project_id: string;
  consultant_id: string;
  project_role: string;
  project_role_en: string;
  added_at: string;
  consultant: Consultant;
}

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSave: (updatedProject: any) => void;
}

export function ManageTeamModal({ isOpen, onClose, project, onSave }: ManageTeamModalProps) {
  const { language, dir } = useLanguage();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [consultantCode, setConsultantCode] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [searchedConsultant, setSearchedConsultant] = useState<Consultant | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // حالات التحرير
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  // تحميل فريق المشروع من قاعدة البيانات
  useEffect(() => {
    if (isOpen && project) {
      loadProjectTeam();
      resetForm();
    }
  }, [isOpen, project]);

  const loadProjectTeam = async () => {
    // استخدام project.id أو قيمة افتراضية
    const projectId = project?.id || 'proj_001';
    
    console.log('Loading team for project:', projectId);
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_teams_2025_12_14_22_21')
        .select(`
          *,
          consultant:consultants_2025_12_14_20_21(*)
        `)
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('added_at', { ascending: true });

      if (error) throw error;
      
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading project team:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحميل فريق المشروع' : 'Failed to load project team',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setConsultantCode('');
    setProjectRole('');
    setSearchedConsultant(null);
    setError(null);
    setEditingMember(null);
    setEditRole('');
  };

  // البحث عن المستشار بالكود
  const searchConsultantByCode = async () => {
    if (!consultantCode.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال كود المستشار' : 'Please enter consultant code');
      return;
    }

    try {
      setSearching(true);
      setError(null);
      
      const { data, error: searchError } = await supabase
        .from('consultants_2025_12_14_20_21')
        .select('*')
        .eq('consultant_code', consultantCode.trim().toUpperCase())
        .eq('status', 'active')
        .single();

      if (searchError || !data) {
        setError(language === 'ar' ? 'لم يتم العثور على مستشار بهذا الكود' : 'No consultant found with this code');
        setSearchedConsultant(null);
        return;
      }

      // التحقق من عدم وجود المستشار في الفريق مسبقاً
      const isAlreadyInTeam = teamMembers.some(member => member.consultant_id === data.id);
      if (isAlreadyInTeam) {
        setError(language === 'ar' ? 'هذا المستشار موجود في الفريق بالفعل' : 'This consultant is already in the team');
        setSearchedConsultant(null);
        return;
      }

      setSearchedConsultant(data);
      setError(null);
    } catch (error) {
      console.error('Error searching consultant:', error);
      setError(language === 'ar' ? 'حدث خطأ أثناء البحث' : 'Error occurred while searching');
    } finally {
      setSearching(false);
    }
  };

  // إضافة المستشار للفريق
  const addConsultantToTeam = async () => {
    if (!searchedConsultant) {
      setError(language === 'ar' ? 'يرجى البحث عن مستشار أولاً' : 'Please search for a consultant first');
      return;
    }

    if (!projectRole.trim()) {
      setError(language === 'ar' ? 'يرجى تحديد دور المستشار في المشروع' : 'Please specify consultant role in project');
      return;
    }

    try {
      setSaving(true);
      
      // الحصول على المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      
      // استخدام project.id أو قيمة افتراضية
      const projectId = project?.id || 'proj_001';
      
      console.log('Adding consultant to team:', {
        project_id: projectId,
        consultant_id: searchedConsultant.id,
        project_role: projectRole,
        added_by: user?.id
      });
      
      // إعداد البيانات للإدراج
      const insertData: any = {
        project_id: projectId,
        consultant_id: searchedConsultant.id,
        project_role: projectRole,
        project_role_en: projectRole
      };
      
      // إضافة added_by فقط إذا كان المستخدم موجود
      if (user?.id) {
        insertData.added_by = user.id;
      }
      
      const { data, error } = await supabase
        .from('project_teams_2025_12_14_22_21')
        .insert([insertData])
        .select(`
          *,
          consultant:consultants_2025_12_14_20_21(*)
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully added consultant:', data);
      setTeamMembers(prev => [...prev, data]);
      resetForm();
      
      toast({
        title: language === 'ar' ? 'تم بنجاح' : 'Success',
        description: language === 'ar' ? 'تم إضافة المستشار للفريق' : 'Consultant added to team'
      });
    } catch (error: any) {
      console.error('Error adding consultant to team:', error);
      
      let errorMessage = language === 'ar' ? 'فشل في إضافة المستشار' : 'Failed to add consultant';
      
      // رسائل خطأ محددة
      if (error?.code === '23505') {
        errorMessage = language === 'ar' ? 'هذا المستشار موجود في الفريق بالفعل' : 'This consultant is already in the team';
      } else if (error?.code === '23503') {
        errorMessage = language === 'ar' ? 'معرف المستشار غير صحيح' : 'Invalid consultant ID';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // حذف عضو من الفريق
  const removeTeamMember = async (memberId: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('project_teams_2025_12_14_22_21')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: language === 'ar' ? 'تم بنجاح' : 'Success',
        description: language === 'ar' ? 'تم حذف المستشار من الفريق' : 'Consultant removed from team'
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف المستشار' : 'Failed to remove consultant',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // بدء تحرير دور المستشار
  const startEditingRole = (member: TeamMember) => {
    setEditingMember(member.id);
    setEditRole(member.project_role);
  };

  // حفظ تحرير الدور
  const saveEditRole = async (memberId: string) => {
    if (!editRole.trim()) {
      setError(language === 'ar' ? 'يرجى تحديد الدور' : 'Please specify role');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('project_teams_2025_12_14_22_21')
        .update({
          project_role: editRole,
          project_role_en: editRole, // يمكن تحسينه لاحقاً
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, project_role: editRole, project_role_en: editRole }
          : member
      ));
      
      setEditingMember(null);
      setEditRole('');
      
      toast({
        title: language === 'ar' ? 'تم بنجاح' : 'Success',
        description: language === 'ar' ? 'تم تحديث دور المستشار' : 'Consultant role updated'
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث الدور' : 'Failed to update role',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // إلغاء التحرير
  const cancelEdit = () => {
    setEditingMember(null);
    setEditRole('');
  };

  // أدوار المشروع
  const projectRoles = [
    'مستشار رئيسي',
    'مستشار فرعي', 
    'مستشار متخصص',
    'محلل',
    'باحث',
    'مراجع',
    'منسق'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'ar' ? 'إدارة فريق المشروع' : 'Manage Project Team'}
            {project && (
              <Badge variant="outline" className="ml-2">
                {language === 'ar' ? project.title : project.titleEn}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* نموذج إضافة عضو جديد */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {language === 'ar' ? 'إضافة عضو للفريق' : 'Add Team Member'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* البحث بكود المستشار */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultantCode">
                    {language === 'ar' ? 'كود المستشار' : 'Consultant Code'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="consultantCode"
                      value={consultantCode}
                      onChange={(e) => setConsultantCode(e.target.value.toUpperCase())}
                      placeholder={language === 'ar' ? 'CON001' : 'CON001'}
                      className="font-mono"
                      onKeyPress={(e) => e.key === 'Enter' && searchConsultantByCode()}
                    />
                    <Button 
                      onClick={searchConsultantByCode} 
                      disabled={searching}
                      variant="outline"
                      size="icon"
                    >
                      {searching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectRole">
                    {language === 'ar' ? 'دور في المشروع' : 'Project Role'}
                  </Label>
                  <Select value={projectRole} onValueChange={setProjectRole}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر الدور' : 'Select role'} />
                    </SelectTrigger>
                    <SelectContent>
                      {projectRoles.map((role, index) => (
                        <SelectItem key={index} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={addConsultantToTeam}
                    disabled={!searchedConsultant || !projectRole || saving}
                    className="w-full"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {language === 'ar' ? 'إضافة للفريق' : 'Add to Team'}
                  </Button>
                </div>
              </div>

              {/* عرض المستشار المبحوث عنه */}
              {searchedConsultant && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        {searchedConsultant.profile_image ? (
                          <AvatarImage src={searchedConsultant.profile_image} alt={searchedConsultant.full_name} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {searchedConsultant.avatar_initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {language === 'ar' ? searchedConsultant.full_name : searchedConsultant.full_name_en}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? searchedConsultant.position : searchedConsultant.position_en}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">
                            {language === 'ar' ? searchedConsultant.department : searchedConsultant.department_en}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {searchedConsultant.consultant_code}
                          </Badge>
                        </div>
                      </div>
                      
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* عرض الأخطاء */}
              {error && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* جدول أعضاء الفريق */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {language === 'ar' ? 'أعضاء الفريق' : 'Team Members'}
                <Badge variant="secondary" className="ml-2">
                  {teamMembers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'المستشار' : 'Consultant'}</TableHead>
                        <TableHead>{language === 'ar' ? 'التخصص' : 'Specialization'}</TableHead>
                        <TableHead>{language === 'ar' ? 'دور في المشروع' : 'Project Role'}</TableHead>
                        <TableHead>{language === 'ar' ? 'القسم' : 'Department'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الكود' : 'Code'}</TableHead>
                        <TableHead>{language === 'ar' ? 'تاريخ الإضافة' : 'Added Date'}</TableHead>
                        <TableHead className="text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                {member.consultant.profile_image ? (
                                  <AvatarImage src={member.consultant.profile_image} alt={member.consultant.full_name} />
                                ) : (
                                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {member.consultant.avatar_initials}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {language === 'ar' ? member.consultant.full_name : member.consultant.full_name_en}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {language === 'ar' ? member.consultant.position : member.consultant.position_en}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {language === 'ar' ? member.consultant.specialization : member.consultant.specialization_en}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {editingMember === member.id ? (
                              <div className="flex items-center gap-2">
                                <Select value={editRole} onValueChange={setEditRole}>
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {projectRoles.map((role, index) => (
                                      <SelectItem key={index} value={role}>
                                        {role}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveEditRole(member.id)}
                                  disabled={saving}
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEdit}
                                >
                                  <X className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge variant="default">
                                  {member.project_role}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingRole(member)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {language === 'ar' ? member.consultant.department : member.consultant.department_en}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {member.consultant.consultant_code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(member.added_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTeamMember(member.id)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'لم يتم إضافة أعضاء للفريق بعد' : 'No team members added yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'ar' ? 'ابدأ بإضافة المستشارين باستخدام أكوادهم' : 'Start by adding consultants using their codes'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* أزرار الإغلاق */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}