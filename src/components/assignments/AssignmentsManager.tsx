import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Upload,
  Send,
  MessageSquare,
  Calendar,
  Trash2,
  Edit,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  member_type: 'pm' | 'consultant' | 'sub_consultant' | 'client_main' | 'client_sub';
  visibility_mode: 'full_project' | 'assigned_only' | 'restricted';
  can_contact_client: boolean;
  added_by_user_id: string;
  created_at: string;
  user_name?: string;
}

interface DeliverableAssignment {
  id: string;
  deliverable_id: string;
  user_id: string;
  assignment_role: 'owner' | 'contributor' | 'internal_reviewer';
  can_view: boolean;
  can_upload: boolean;
  can_submit: boolean;
  can_respond: boolean;
  assigned_by_user_id: string;
  assigned_at: string;
  user_name?: string;
  deliverable_name?: string;
}

interface DeliverableGrant {
  id: string;
  deliverable_id: string;
  grantee_user_id: string;
  granted_by_user_id: string;
  access_level: 'view' | 'comment' | 'review' | 'approve';
  expires_at?: string;
  created_at: string;
  grantee_name?: string;
  deliverable_name?: string;
}

interface AssignmentsManagerProps {
  projectId?: string;
  deliverableId?: string;
}

export function AssignmentsManager({ projectId, deliverableId }: AssignmentsManagerProps) {
  const { userProfile, hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [deliverableAssignments, setDeliverableAssignments] = useState<DeliverableAssignment[]>([]);
  const [deliverableGrants, setDeliverableGrants] = useState<DeliverableGrant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showAddAssignmentDialog, setShowAddAssignmentDialog] = useState(false);
  const [showAddGrantDialog, setShowAddGrantDialog] = useState(false);
  
  // Form states
  const [newMember, setNewMember] = useState({
    userId: '',
    memberType: 'consultant' as ProjectMember['member_type'],
    visibilityMode: 'full_project' as ProjectMember['visibility_mode'],
    canContactClient: false,
    messageToUser: '',
    notifyEmail: true
  });
  
  const [newAssignment, setNewAssignment] = useState({
    userId: '',
    assignmentRole: 'contributor' as DeliverableAssignment['assignment_role'],
    canView: true,
    canUpload: false,
    canSubmit: false,
    canRespond: false,
    messageToUser: '',
    notifyEmail: true
  });
  
  const [newGrant, setNewGrant] = useState({
    granteeUserId: '',
    accessLevel: 'view' as DeliverableGrant['access_level'],
    expiresAt: '',
    messageToUser: '',
    notifyEmail: true
  });

  // Check user permissions based on role
  const canManageProjectMembers = () => {
    return userProfile?.role === 'system_admin' || userProfile?.role === 'project_manager';
  };

  const canManageDeliverableAssignments = () => {
    return userProfile?.role === 'system_admin' || userProfile?.role === 'project_manager';
  };

  const canManageGrants = () => {
    return userProfile?.role === 'system_admin' || 
           userProfile?.role === 'project_manager' || 
           userProfile?.role === 'main_client';
  };

  const canViewAllData = () => {
    return userProfile?.role === 'system_admin' || userProfile?.role === 'project_manager';
  };

  // Filter data based on user role and permissions
  const getFilteredProjectMembers = () => {
    if (canViewAllData()) {
      return mockProjectMembers;
    }
    
    // Main clients can see members of their projects only
    if (userProfile?.role === 'main_client') {
      return mockProjectMembers.filter(member => 
        member.project_id === projectId && 
        (member.member_type === 'client_main' || member.member_type === 'client_sub')
      );
    }
    
    // Other roles see limited data
    return mockProjectMembers.filter(member => 
      member.user_id === userProfile?.id || member.added_by_user_id === userProfile?.id
    );
  };

  const getFilteredDeliverableAssignments = () => {
    if (canViewAllData()) {
      return mockDeliverableAssignments;
    }
    
    // Users can only see their own assignments
    return mockDeliverableAssignments.filter(assignment => 
      assignment.user_id === userProfile?.id || assignment.assigned_by_user_id === userProfile?.id
    );
  };

  const getFilteredDeliverableGrants = () => {
    if (canViewAllData()) {
      return mockDeliverableGrants;
    }
    
    // Main clients can see grants they created or received
    if (userProfile?.role === 'main_client') {
      return mockDeliverableGrants.filter(grant => 
        grant.granted_by_user_id === userProfile?.id || grant.grantee_user_id === userProfile?.id
      );
    }
    
    // Sub clients can only see grants they received
    return mockDeliverableGrants.filter(grant => 
      grant.grantee_user_id === userProfile?.id
    );
  };

  // Mock data (same as before but will be filtered)
  const mockProjectMembers: ProjectMember[] = [
    {
      id: '1',
      project_id: projectId || 'proj-1',
      user_id: 'user-1',
      member_type: 'consultant',
      visibility_mode: 'full_project',
      can_contact_client: true,
      added_by_user_id: 'admin-1',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user_name: 'محمد أحمد - مستشار'
    },
    {
      id: '2',
      project_id: projectId || 'proj-1',
      user_id: 'user-2',
      member_type: 'sub_consultant',
      visibility_mode: 'assigned_only',
      can_contact_client: false,
      added_by_user_id: 'admin-1',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user_name: 'سارة علي - مستشار فرعي'
    },
    {
      id: '3',
      project_id: projectId || 'proj-1',
      user_id: userProfile?.id || 'user-3',
      member_type: 'client_main',
      visibility_mode: 'full_project',
      can_contact_client: true,
      added_by_user_id: 'admin-1',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      user_name: 'سلطان منصور - عميل رئيسي'
    }
  ];

  const mockDeliverableAssignments: DeliverableAssignment[] = [
    {
      id: '1',
      deliverable_id: deliverableId || 'del-1',
      user_id: userProfile?.id || 'user-1',
      assignment_role: 'owner',
      can_view: true,
      can_upload: true,
      can_submit: true,
      can_respond: true,
      assigned_by_user_id: 'admin-1',
      assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user_name: 'محمد أحمد',
      deliverable_name: 'التصميم الأولي'
    },
    {
      id: '2',
      deliverable_id: deliverableId || 'del-1',
      user_id: 'user-2',
      assignment_role: 'contributor',
      can_view: true,
      can_upload: true,
      can_submit: false,
      can_respond: true,
      assigned_by_user_id: 'admin-1',
      assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user_name: 'سارة علي',
      deliverable_name: 'التصميم الأولي'
    }
  ];

  const mockDeliverableGrants: DeliverableGrant[] = [
    {
      id: '1',
      deliverable_id: deliverableId || 'del-1',
      grantee_user_id: userProfile?.role === 'sub_client' ? userProfile.id : 'user-4',
      granted_by_user_id: userProfile?.role === 'main_client' ? userProfile.id : 'user-3',
      access_level: 'review',
      expires_at: '2025-12-31T23:59:59Z',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      grantee_name: 'عبدالعزيز العتيبي',
      deliverable_name: 'التصميم الأولي'
    }
  ];

  useEffect(() => {
    // Load filtered data based on user role
    setProjectMembers(getFilteredProjectMembers());
    setDeliverableAssignments(getFilteredDeliverableAssignments());
    setDeliverableGrants(getFilteredDeliverableGrants());
    setLoading(false);
  }, [projectId, deliverableId, userProfile]);

  const handleAddMember = async () => {
    if (!canManageProjectMembers()) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية لإضافة أعضاء المشروع",
        variant: "destructive",
      });
      return;
    }

    try {
      const newMemberData: ProjectMember = {
        id: Date.now().toString(),
        project_id: projectId || 'proj-1',
        user_id: newMember.userId,
        member_type: newMember.memberType,
        visibility_mode: newMember.visibilityMode,
        can_contact_client: newMember.canContactClient,
        added_by_user_id: userProfile?.id || 'current-user',
        created_at: new Date().toISOString(),
        user_name: `مستخدم جديد - ${newMember.memberType}`
      };

      setProjectMembers(prev => [newMemberData, ...prev]);
      setShowAddMemberDialog(false);
      setNewMember({
        userId: '',
        memberType: 'consultant',
        visibilityMode: 'full_project',
        canContactClient: false,
        messageToUser: '',
        notifyEmail: true
      });

      toast({
        title: "تم إضافة العضو بنجاح",
        description: "تم إرسال إشعار للعضو الجديد",
      });
    } catch (error) {
      toast({
        title: "خطأ في إضافة العضو",
        description: "حدث خطأ أثناء إضافة العضو",
        variant: "destructive",
      });
    }
  };

  const handleAddAssignment = async () => {
    if (!canManageDeliverableAssignments()) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية لإنشاء تكليفات المخرجات",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAssignmentData: DeliverableAssignment = {
        id: Date.now().toString(),
        deliverable_id: deliverableId || 'del-1',
        user_id: newAssignment.userId,
        assignment_role: newAssignment.assignmentRole,
        can_view: newAssignment.canView,
        can_upload: newAssignment.canUpload,
        can_submit: newAssignment.canSubmit,
        can_respond: newAssignment.canRespond,
        assigned_by_user_id: userProfile?.id || 'current-user',
        assigned_at: new Date().toISOString(),
        user_name: 'مستخدم جديد',
        deliverable_name: 'مخرج جديد'
      };

      setDeliverableAssignments(prev => [newAssignmentData, ...prev]);
      setShowAddAssignmentDialog(false);
      setNewAssignment({
        userId: '',
        assignmentRole: 'contributor',
        canView: true,
        canUpload: false,
        canSubmit: false,
        canRespond: false,
        messageToUser: '',
        notifyEmail: true
      });

      toast({
        title: "تم إنشاء التكليف بنجاح",
        description: "تم إرسال إشعار للمستخدم المكلف",
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء التكليف",
        description: "حدث خطأ أثناء إنشاء التكليف",
        variant: "destructive",
      });
    }
  };

  // Edit and Delete functions for Project Members
  const handleEditMember = (member: ProjectMember) => {
    // Set form data for editing
    setNewMember({
      userId: member.user_id,
      memberType: member.member_type,
      visibilityMode: member.visibility_mode,
      canContactClient: member.can_contact_client,
      messageToUser: '',
      notifyEmail: true
    });
    setShowAddMemberDialog(true);
  };

  const handleDeleteMember = (memberId: string) => {
    setProjectMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: "تم حذف العضو",
      description: "تم حذف العضو من المشروع بنجاح",
    });
  };

  // Edit and Delete functions for Deliverable Assignments
  const handleEditAssignment = (assignment: DeliverableAssignment) => {
    setNewAssignment({
      userId: assignment.user_id,
      assignmentRole: assignment.assignment_role,
      canView: assignment.can_view,
      canUpload: assignment.can_upload,
      canSubmit: assignment.can_submit,
      canRespond: assignment.can_respond,
      messageToUser: '',
      notifyEmail: true
    });
    setShowAddAssignmentDialog(true);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setDeliverableAssignments(prev => prev.filter(a => a.id !== assignmentId));
    toast({
      title: "تم حذف التكليف",
      description: "تم حذف التكليف بنجاح",
    });
  };

  // Edit and Delete functions for Deliverable Grants
  const handleEditGrant = (grant: DeliverableGrant) => {
    setNewGrant({
      granteeUserId: grant.grantee_user_id,
      accessLevel: grant.access_level,
      expiresAt: grant.expires_at ? new Date(grant.expires_at).toISOString().slice(0, 16) : '',
      messageToUser: '',
      notifyEmail: true
    });
    setShowAddGrantDialog(true);
  };

  const handleDeleteGrant = (grantId: string) => {
    setDeliverableGrants(prev => prev.filter(g => g.id !== grantId));
    toast({
      title: "تم إلغاء الصلاحية",
      description: "تم إلغاء الصلاحية بنجاح",
    });
  };

  const handleAddGrant = async () => {
    if (!canManageGrants()) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية لمنح الصلاحيات",
        variant: "destructive",
      });
      return;
    }

    try {
      const newGrantData: DeliverableGrant = {
        id: Date.now().toString(),
        deliverable_id: deliverableId || 'del-1',
        grantee_user_id: newGrant.granteeUserId,
        granted_by_user_id: userProfile?.id || 'current-user',
        access_level: newGrant.accessLevel,
        expires_at: newGrant.expiresAt || undefined,
        created_at: new Date().toISOString(),
        grantee_name: 'مستخدم جديد',
        deliverable_name: 'مخرج جديد'
      };

      setDeliverableGrants(prev => [newGrantData, ...prev]);
      setShowAddGrantDialog(false);
      setNewGrant({
        granteeUserId: '',
        accessLevel: 'view',
        expiresAt: '',
        messageToUser: '',
        notifyEmail: true
      });

      toast({
        title: "تم منح الصلاحية بنجاح",
        description: "تم إرسال إشعار للمستخدم",
      });
    } catch (error) {
      toast({
        title: "خطأ في منح الصلاحية",
        description: "حدث خطأ أثناء منح الصلاحية",
        variant: "destructive",
      });
    }
  };

  const getMemberTypeLabel = (type: string) => {
    const labels = {
      pm: 'مدير مشروع',
      consultant: 'مستشار',
      sub_consultant: 'مستشار فرعي',
      client_main: 'عميل رئيسي',
      client_sub: 'عميل فرعي'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getVisibilityModeLabel = (mode: string) => {
    const labels = {
      full_project: 'المشروع كاملاً',
      assigned_only: 'المكلف به فقط',
      restricted: 'محدود'
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  const getAssignmentRoleLabel = (role: string) => {
    const labels = {
      owner: 'مالك',
      contributor: 'مساهم',
      internal_reviewer: 'مراجع داخلي'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getAccessLevelLabel = (level: string) => {
    const labels = {
      view: 'عرض',
      comment: 'تعليق',
      review: 'مراجعة',
      approve: 'اعتماد'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show access denied message for users without any permissions
  if (!canManageProjectMembers() && !canManageDeliverableAssignments() && !canManageGrants()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Lock className="w-16 h-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">غير مصرح بالوصول</h2>
          <p className="text-sm text-muted-foreground mt-2">
            ليس لديك صلاحية للوصول إلى إدارة التكليفات والصلاحيات
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">إدارة التكليفات والصلاحيات</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          الدور: {userProfile?.role === 'system_admin' ? 'مدير النظام' : 
                  userProfile?.role === 'project_manager' ? 'مدير المشروع' :
                  userProfile?.role === 'main_client' ? 'عميل رئيسي' : 'مستخدم'}
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {canManageProjectMembers() && (
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              أعضاء المشروع
              <Badge variant="secondary" className="rounded-full text-xs">
                {projectMembers.length}
              </Badge>
            </TabsTrigger>
          )}
          {canManageDeliverableAssignments() && (
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              تكليفات المخرجات
              <Badge variant="secondary" className="rounded-full text-xs">
                {deliverableAssignments.length}
              </Badge>
            </TabsTrigger>
          )}
          {canManageGrants() && (
            <TabsTrigger value="grants" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              صلاحيات العملاء
              <Badge variant="secondary" className="rounded-full text-xs">
                {deliverableGrants.length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Project Members Tab */}
        {canManageProjectMembers() && (
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    أعضاء المشروع
                  </CardTitle>
                  {canManageProjectMembers() && (
                    <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <UserPlus className="w-4 h-4" />
                          إضافة عضو
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>إضافة عضو جديد للمشروع</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="userId">معرف المستخدم</Label>
                            <Input
                              id="userId"
                              value={newMember.userId}
                              onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
                              placeholder="أدخل معرف المستخدم"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="memberType">نوع العضوية</Label>
                            <Select value={newMember.memberType} onValueChange={(value: any) => setNewMember({ ...newMember, memberType: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="consultant">مستشار</SelectItem>
                                <SelectItem value="sub_consultant">مستشار فرعي</SelectItem>
                                <SelectItem value="client_main">عميل رئيسي</SelectItem>
                                <SelectItem value="client_sub">عميل فرعي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="visibilityMode">نمط الرؤية</Label>
                            <Select value={newMember.visibilityMode} onValueChange={(value: any) => setNewMember({ ...newMember, visibilityMode: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full_project">المشروع كاملاً</SelectItem>
                                <SelectItem value="assigned_only">المكلف به فقط</SelectItem>
                                <SelectItem value="restricted">محدود</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="canContactClient"
                              checked={newMember.canContactClient}
                              onCheckedChange={(checked) => setNewMember({ ...newMember, canContactClient: checked })}
                            />
                            <Label htmlFor="canContactClient">يمكن التواصل مع العميل</Label>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="messageToUser">رسالة للمستخدم (اختيارية)</Label>
                            <Textarea
                              id="messageToUser"
                              value={newMember.messageToUser}
                              onChange={(e) => setNewMember({ ...newMember, messageToUser: e.target.value })}
                              placeholder="رسالة ترحيبية أو تعليمات"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="notifyEmail"
                              checked={newMember.notifyEmail}
                              onCheckedChange={(checked) => setNewMember({ ...newMember, notifyEmail: checked })}
                            />
                            <Label htmlFor="notifyEmail">إرسال إشعار بالإيميل</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddMember} className="flex-1">
                              إضافة العضو
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {projectMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        لا يوجد أعضاء في المشروع حالياً
                      </div>
                    ) : (
                      projectMembers.map((member) => (
                        <div key={member.id} className="p-4 rounded-lg border bg-muted/20">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{member.user_name}</h3>
                                <Badge variant="outline">
                                  {getMemberTypeLabel(member.member_type)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {getVisibilityModeLabel(member.visibility_mode)}
                                </span>
                                {member.can_contact_client && (
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    يمكن التواصل مع العميل
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(member.created_at)}
                                </span>
                              </div>
                            </div>
                            {canManageProjectMembers() && (
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditMember(member)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Deliverable Assignments Tab */}
        {canManageDeliverableAssignments() && (
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    تكليفات المخرجات
                  </CardTitle>
                  {canManageDeliverableAssignments() && (
                    <Dialog open={showAddAssignmentDialog} onOpenChange={setShowAddAssignmentDialog}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <UserPlus className="w-4 h-4" />
                          إنشاء تكليف
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>إنشاء تكليف جديد</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignUserId">معرف المستخدم</Label>
                            <Input
                              id="assignUserId"
                              value={newAssignment.userId}
                              onChange={(e) => setNewAssignment({ ...newAssignment, userId: e.target.value })}
                              placeholder="أدخل معرف المستخدم"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="assignmentRole">دور التكليف</Label>
                            <Select value={newAssignment.assignmentRole} onValueChange={(value: any) => setNewAssignment({ ...newAssignment, assignmentRole: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">مالك</SelectItem>
                                <SelectItem value="contributor">مساهم</SelectItem>
                                <SelectItem value="internal_reviewer">مراجع داخلي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label>الصلاحيات</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="canView"
                                  checked={newAssignment.canView}
                                  onCheckedChange={(checked) => setNewAssignment({ ...newAssignment, canView: checked })}
                                />
                                <Label htmlFor="canView">يمكن العرض</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="canUpload"
                                  checked={newAssignment.canUpload}
                                  onCheckedChange={(checked) => setNewAssignment({ ...newAssignment, canUpload: checked })}
                                />
                                <Label htmlFor="canUpload">يمكن الرفع</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="canSubmit"
                                  checked={newAssignment.canSubmit}
                                  onCheckedChange={(checked) => setNewAssignment({ ...newAssignment, canSubmit: checked })}
                                />
                                <Label htmlFor="canSubmit">يمكن التسليم</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="canRespond"
                                  checked={newAssignment.canRespond}
                                  onCheckedChange={(checked) => setNewAssignment({ ...newAssignment, canRespond: checked })}
                                />
                                <Label htmlFor="canRespond">يمكن الرد</Label>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="assignMessageToUser">رسالة للمستخدم (اختيارية)</Label>
                            <Textarea
                              id="assignMessageToUser"
                              value={newAssignment.messageToUser}
                              onChange={(e) => setNewAssignment({ ...newAssignment, messageToUser: e.target.value })}
                              placeholder="تعليمات أو ملاحظات للتكليف"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="assignNotifyEmail"
                              checked={newAssignment.notifyEmail}
                              onCheckedChange={(checked) => setNewAssignment({ ...newAssignment, notifyEmail: checked })}
                            />
                            <Label htmlFor="assignNotifyEmail">إرسال إشعار بالإيميل</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddAssignment} className="flex-1">
                              إنشاء التكليف
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddAssignmentDialog(false)}>
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {deliverableAssignments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        لا توجد تكليفات حالياً
                      </div>
                    ) : (
                      deliverableAssignments.map((assignment) => (
                        <div key={assignment.id} className="p-4 rounded-lg border bg-muted/20">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{assignment.user_name}</h3>
                                <Badge variant="outline">
                                  {getAssignmentRoleLabel(assignment.assignment_role)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {assignment.deliverable_name}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                {assignment.can_view && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Eye className="w-3 h-3" />
                                    عرض
                                  </Badge>
                                )}
                                {assignment.can_upload && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Upload className="w-3 h-3" />
                                    رفع
                                  </Badge>
                                )}
                                {assignment.can_submit && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Send className="w-3 h-3" />
                                    تسليم
                                  </Badge>
                                )}
                                {assignment.can_respond && (
                                  <Badge variant="secondary" className="gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    رد
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(assignment.assigned_at)}
                              </div>
                            </div>
                            {canManageDeliverableAssignments() && (
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditAssignment(assignment)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Deliverable Grants Tab */}
        {canManageGrants() && (
          <TabsContent value="grants">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    صلاحيات العملاء
                  </CardTitle>
                  {canManageGrants() && (
                    <Dialog open={showAddGrantDialog} onOpenChange={setShowAddGrantDialog}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Shield className="w-4 h-4" />
                          منح صلاحية
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>منح صلاحية جديدة</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="granteeUserId">معرف المستخدم</Label>
                            <Input
                              id="granteeUserId"
                              value={newGrant.granteeUserId}
                              onChange={(e) => setNewGrant({ ...newGrant, granteeUserId: e.target.value })}
                              placeholder="أدخل معرف المستخدم"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accessLevel">مستوى الصلاحية</Label>
                            <Select value={newGrant.accessLevel} onValueChange={(value: any) => setNewGrant({ ...newGrant, accessLevel: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="view">عرض</SelectItem>
                                <SelectItem value="comment">تعليق</SelectItem>
                                <SelectItem value="review">مراجعة</SelectItem>
                                <SelectItem value="approve">اعتماد</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiresAt">تاريخ الانتهاء (اختياري)</Label>
                            <Input
                              id="expiresAt"
                              type="datetime-local"
                              value={newGrant.expiresAt}
                              onChange={(e) => setNewGrant({ ...newGrant, expiresAt: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="grantMessageToUser">رسالة للمستخدم (اختيارية)</Label>
                            <Textarea
                              id="grantMessageToUser"
                              value={newGrant.messageToUser}
                              onChange={(e) => setNewGrant({ ...newGrant, messageToUser: e.target.value })}
                              placeholder="تعليمات أو ملاحظات للصلاحية"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="grantNotifyEmail"
                              checked={newGrant.notifyEmail}
                              onCheckedChange={(checked) => setNewGrant({ ...newGrant, notifyEmail: checked })}
                            />
                            <Label htmlFor="grantNotifyEmail">إرسال إشعار بالإيميل</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddGrant} className="flex-1">
                              منح الصلاحية
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddGrantDialog(false)}>
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {deliverableGrants.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        لا توجد صلاحيات ممنوحة حالياً
                      </div>
                    ) : (
                      deliverableGrants.map((grant) => (
                        <div key={grant.id} className="p-4 rounded-lg border bg-muted/20">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{grant.grantee_name}</h3>
                                <Badge variant="outline">
                                  {getAccessLevelLabel(grant.access_level)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {grant.deliverable_name}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(grant.created_at)}
                                </span>
                                {grant.expires_at && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    ينتهي: {new Date(grant.expires_at).toLocaleDateString('ar')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {canManageGrants() && (
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditGrant(grant)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteGrant(grant.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}