import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Plus, 
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Search,
  Filter,
  UserCheck,
  Mail,
  Phone,
  Building,
  Award
} from "lucide-react";

interface Consultant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  department: string;
  experience_years: number;
  status: 'active' | 'inactive';
  consultant_code: string;
}

interface ProjectTeamMember {
  id: string;
  project_id: string;
  consultant_id: string;
  consultant: Consultant;
  project_role: string;
  project_role_en: string;
  added_at: string;
  added_by: string;
  status: 'active' | 'inactive';
}

interface ProjectTeamManagerProps {
  projectId: string;
  projectName: string;
}

const ProjectTeamManager: React.FC<ProjectTeamManagerProps> = ({ projectId, projectName }) => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [availableConsultants, setAvailableConsultants] = useState<Consultant[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectTeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [projectRoleEn, setProjectRoleEn] = useState('');

  // Mock data - في التطبيق الحقيقي سيتم جلبها من Supabase
  useEffect(() => {
    loadTeamMembers();
    loadAvailableConsultants();
  }, [projectId]);

  const loadTeamMembers = async () => {
    setLoading(true);
    // محاكاة بيانات أعضاء الفريق
    const mockTeamMembers: ProjectTeamMember[] = [
      {
        id: '1',
        project_id: projectId,
        consultant_id: 'c1',
        consultant: {
          id: 'c1',
          name: 'أحمد محمد السعيد',
          email: 'ahmed.mohamed@company.com',
          phone: '+966501234567',
          specialization: 'تطوير البرمجيات',
          department: 'تقنية المعلومات',
          experience_years: 8,
          status: 'active',
          consultant_code: 'CON001'
        },
        project_role: 'مطور رئيسي',
        project_role_en: 'Lead Developer',
        added_at: '2024-01-15T10:00:00Z',
        added_by: 'current-user',
        status: 'active'
      },
      {
        id: '2',
        project_id: projectId,
        consultant_id: 'c2',
        consultant: {
          id: 'c2',
          name: 'سارة أحمد علي',
          email: 'sara.ahmed@company.com',
          phone: '+966507654321',
          specialization: 'تصميم واجهات المستخدم',
          department: 'التصميم',
          experience_years: 5,
          status: 'active',
          consultant_code: 'CON002'
        },
        project_role: 'مصمم واجهات',
        project_role_en: 'UI/UX Designer',
        added_at: '2024-01-16T09:30:00Z',
        added_by: 'current-user',
        status: 'active'
      }
    ];
    setTeamMembers(mockTeamMembers);
    setLoading(false);
  };

  const loadAvailableConsultants = async () => {
    // محاكاة بيانات المستشارين المتاحين
    const mockConsultants: Consultant[] = [
      {
        id: 'c3',
        name: 'محمد علي حسن',
        email: 'mohamed.ali@company.com',
        phone: '+966509876543',
        specialization: 'إدارة المشاريع',
        department: 'إدارة المشاريع',
        experience_years: 10,
        status: 'active',
        consultant_code: 'CON003'
      },
      {
        id: 'c4',
        name: 'فاطمة خالد',
        email: 'fatima.khaled@company.com',
        phone: '+966502468135',
        specialization: 'ضمان الجودة',
        department: 'الجودة',
        experience_years: 6,
        status: 'active',
        consultant_code: 'CON004'
      },
      {
        id: 'c5',
        name: 'عبدالله سعد',
        email: 'abdullah.saad@company.com',
        phone: '+966503691472',
        specialization: 'تحليل الأعمال',
        department: 'تحليل الأعمال',
        experience_years: 7,
        status: 'active',
        consultant_code: 'CON005'
      }
    ];
    setAvailableConsultants(mockConsultants);
  };

  const handleAddMember = async () => {
    if (!selectedConsultant || !projectRole.trim()) {
      toast({
        title: "خطأ",
        description: "يجب اختيار المستشار وتحديد دوره في المشروع",
        variant: "destructive"
      });
      return;
    }

    const consultant = availableConsultants.find(c => c.id === selectedConsultant);
    if (!consultant) return;

    // التحقق من عدم وجود المستشار في الفريق مسبقاً
    const existingMember = teamMembers.find(m => m.consultant_id === selectedConsultant);
    if (existingMember) {
      toast({
        title: "خطأ",
        description: "هذا المستشار موجود بالفعل في فريق المشروع",
        variant: "destructive"
      });
      return;
    }

    const newMember: ProjectTeamMember = {
      id: Date.now().toString(),
      project_id: projectId,
      consultant_id: selectedConsultant,
      consultant: consultant,
      project_role: projectRole,
      project_role_en: projectRoleEn || projectRole,
      added_at: new Date().toISOString(),
      added_by: 'current-user',
      status: 'active'
    };

    setTeamMembers([...teamMembers, newMember]);
    setShowAddDialog(false);
    setSelectedConsultant('');
    setProjectRole('');
    setProjectRoleEn('');

    toast({
      title: "تم إضافة المستشار",
      description: `تم إضافة ${consultant.name} إلى فريق المشروع بنجاح`,
    });
  };

  const handleEditMember = (member: ProjectTeamMember) => {
    setEditingMember(member);
    setProjectRole(member.project_role);
    setProjectRoleEn(member.project_role_en);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember || !projectRole.trim()) {
      toast({
        title: "خطأ",
        description: "يجب تحديد دور المستشار في المشروع",
        variant: "destructive"
      });
      return;
    }

    const updatedMembers = teamMembers.map(member =>
      member.id === editingMember.id
        ? {
            ...member,
            project_role: projectRole,
            project_role_en: projectRoleEn || projectRole
          }
        : member
    );

    setTeamMembers(updatedMembers);
    setShowEditDialog(false);
    setEditingMember(null);
    setProjectRole('');
    setProjectRoleEn('');

    toast({
      title: "تم تحديث الدور",
      description: `تم تحديث دور ${editingMember.consultant.name} في المشروع`,
    });
  };

  const handleRemoveMember = async (member: ProjectTeamMember) => {
    const updatedMembers = teamMembers.filter(m => m.id !== member.id);
    setTeamMembers(updatedMembers);

    toast({
      title: "تم إزالة المستشار",
      description: `تم إزالة ${member.consultant.name} من فريق المشروع`,
    });
  };

  const filteredMembers = teamMembers.filter(member =>
    member.consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.project_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">فريق المشروع</h2>
          <p className="text-gray-600 mt-1">إدارة المستشارين المعينين للمشروع: {projectName}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          إضافة مستشار
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث في أعضاء الفريق..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          فلترة
        </Button>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">جاري تحميل أعضاء الفريق...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد أعضاء في الفريق</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة المستشارين إلى فريق المشروع</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                إضافة أول مستشار
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.consultant.name}
                        </h3>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">الدور:</span>
                          <span>{member.project_role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">القسم:</span>
                          <span>{member.consultant.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">البريد:</span>
                          <span>{member.consultant.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">الهاتف:</span>
                          <span>{member.consultant.phone || 'غير محدد'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        أضيف في: {new Date(member.added_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة مستشار إلى فريق المشروع</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="consultant">اختيار المستشار *</Label>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المستشار" />
                </SelectTrigger>
                <SelectContent>
                  {availableConsultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{consultant.name}</span>
                        <span className="text-sm text-gray-500">({consultant.specialization})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">دور المستشار في المشروع *</Label>
                <Input
                  id="role"
                  value={projectRole}
                  onChange={(e) => setProjectRole(e.target.value)}
                  placeholder="مثال: مطور رئيسي، مصمم واجهات"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-en">الدور (بالإنجليزية)</Label>
                <Input
                  id="role-en"
                  value={projectRoleEn}
                  onChange={(e) => setProjectRoleEn(e.target.value)}
                  placeholder="Lead Developer, UI Designer"
                />
              </div>
            </div>
            
            {selectedConsultant && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">معلومات المستشار المختار:</h4>
                {(() => {
                  const consultant = availableConsultants.find(c => c.id === selectedConsultant);
                  return consultant ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">الاسم:</span> {consultant.name}</div>
                      <div><span className="font-medium">التخصص:</span> {consultant.specialization}</div>
                      <div><span className="font-medium">القسم:</span> {consultant.department}</div>
                      <div><span className="font-medium">سنوات الخبرة:</span> {consultant.experience_years}</div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddMember}>
              إضافة إلى الفريق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تحرير دور المستشار</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingMember && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h4 className="font-medium mb-2">المستشار:</h4>
                <div className="text-sm">
                  <div><span className="font-medium">الاسم:</span> {editingMember.consultant.name}</div>
                  <div><span className="font-medium">التخصص:</span> {editingMember.consultant.specialization}</div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">دور المستشار في المشروع *</Label>
                <Input
                  id="edit-role"
                  value={projectRole}
                  onChange={(e) => setProjectRole(e.target.value)}
                  placeholder="مثال: مطور رئيسي، مصمم واجهات"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role-en">الدور (بالإنجليزية)</Label>
                <Input
                  id="edit-role-en"
                  value={projectRoleEn}
                  onChange={(e) => setProjectRoleEn(e.target.value)}
                  placeholder="Lead Developer, UI Designer"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit}>
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectTeamManager;