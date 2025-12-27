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
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  Building,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Send,
  Ban,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RegistrationRequest {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  organization?: string;
  requested_role: 'main_client' | 'sub_client';
  registration_reason?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'DEACTIVATED';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by_user_id?: string;
  rejection_reason?: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  organization?: string;
  role: 'system_admin' | 'project_manager' | 'project_consultant' | 'main_client' | 'sub_client';
  status: 'PENDING_APPROVAL' | 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  created_by_user_id?: string;
  last_login_at?: string;
  created_at: string;
}

interface UserInvitation {
  id: string;
  email: string;
  full_name: string;
  role: string;
  invited_by_user_id: string;
  invitation_token: string;
  token_expires_at: string;
  status: 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  accepted_at?: string;
  message_to_user?: string;
  created_at: string;
}

export function UserManagement() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [userInvitations, setUserInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showRequestDetailsDialog, setShowRequestDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'project_consultant' as UserProfile['role'],
    messageToUser: '',
    sendEmail: true
  });

  // Check if user can manage users (system admin only)
  const canManageUsers = () => {
    return userProfile?.role === 'system_admin';
  };

  // Mock data for registration requests
  const mockRegistrationRequests: RegistrationRequest[] = [
    {
      id: '1',
      email: 'ahmed.client@example.com',
      full_name: 'أحمد محمد العتيبي',
      phone: '+966501234567',
      organization: 'شركة العتيبي للاستشارات',
      requested_role: 'main_client',
      registration_reason: 'أحتاج للوصول إلى منصة إدارة المشاريع لمتابعة مشاريع الشركة',
      status: 'PENDING_APPROVAL',
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      email: 'sara.subclient@example.com',
      full_name: 'سارة أحمد الزهراني',
      phone: '+966507654321',
      organization: 'مؤسسة الزهراني التجارية',
      requested_role: 'sub_client',
      registration_reason: 'أرغب في الحصول على صلاحية للاطلاع على تقارير المشاريع',
      status: 'PENDING_APPROVAL',
      submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      email: 'omar.client@example.com',
      full_name: 'عمر سعد القحطاني',
      phone: '+966509876543',
      organization: 'مجموعة القحطاني',
      requested_role: 'main_client',
      registration_reason: 'نحتاج لإدارة مشاريع متعددة من خلال المنصة',
      status: 'PENDING_APPROVAL',
      submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Mock data for user profiles
  const mockUserProfiles: UserProfile[] = [
    {
      id: '1',
      user_id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@system.com',
      full_name: 'محمد رشاد - مدير النظام',
      role: 'system_admin',
      status: 'ACTIVE',
      last_login_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      user_id: '22222222-2222-2222-2222-222222222222',
      email: 'manager@project.com',
      full_name: 'أحمد سالم - مدير المشروع',
      role: 'project_manager',
      status: 'ACTIVE',
      created_by_user_id: '11111111-1111-1111-1111-111111111111',
      last_login_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      user_id: '33333333-3333-3333-3333-333333333333',
      email: 'consultant@project.com',
      full_name: 'فاطمة علي - مستشار المشروع',
      role: 'project_consultant',
      status: 'ACTIVE',
      created_by_user_id: '11111111-1111-1111-1111-111111111111',
      last_login_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      user_id: '44444444-4444-4444-4444-444444444444',
      email: 'main@client.com',
      full_name: 'خالد منصور - عميل رئيسي',
      role: 'main_client',
      status: 'ACTIVE',
      created_by_user_id: '22222222-2222-2222-2222-222222222222',
      last_login_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      user_id: '55555555-5555-5555-5555-555555555555',
      email: 'sub@client.com',
      full_name: 'نورا أحمد - عميل فرعي',
      role: 'sub_client',
      status: 'SUSPENDED',
      created_by_user_id: '44444444-4444-4444-4444-444444444444',
      last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Mock data for user invitations
  const mockUserInvitations: UserInvitation[] = [
    {
      id: '1',
      email: 'newconsultant@example.com',
      full_name: 'يوسف عبدالله الشمري',
      role: 'project_consultant',
      invited_by_user_id: '11111111-1111-1111-1111-111111111111',
      invitation_token: 'inv_token_123456789',
      token_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SENT',
      message_to_user: 'مرحباً بك في منصة إدارة المشاريع. يرجى تفعيل حسابك وتعيين كلمة مرور قوية.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      email: 'newmanager@example.com',
      full_name: 'ريم سعد الدوسري',
      role: 'project_manager',
      invited_by_user_id: '11111111-1111-1111-1111-111111111111',
      invitation_token: 'inv_token_987654321',
      token_expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SENT',
      message_to_user: 'تم دعوتك كمدير مشروع. يرجى إكمال عملية التسجيل.',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    if (canManageUsers()) {
      // Load data
      setRegistrationRequests(mockRegistrationRequests);
      setUserProfiles(mockUserProfiles);
      setUserInvitations(mockUserInvitations);
    }
    setLoading(false);
  }, [userProfile]);

  const handleCreateUser = async () => {
    if (!canManageUsers()) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية لإنشاء مستخدمين جدد",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call
      const newInvitation: UserInvitation = {
        id: Date.now().toString(),
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
        invited_by_user_id: userProfile?.id || 'current-user',
        invitation_token: `inv_token_${Date.now()}`,
        token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'SENT',
        message_to_user: newUser.messageToUser || 'مرحباً بك في منصة إدارة المشاريع.',
        created_at: new Date().toISOString()
      };

      setUserInvitations(prev => [newInvitation, ...prev]);
      setShowCreateUserDialog(false);
      setNewUser({
        email: '',
        fullName: '',
        role: 'project_consultant',
        messageToUser: '',
        sendEmail: true
      });

      toast({
        title: "تم إنشاء الدعوة بنجاح",
        description: `تم إرسال دعوة إلى ${newUser.email}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: "حدث خطأ أثناء إنشاء دعوة المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleApproveRequest = async (requestId: string, approved: boolean, rejectionReason?: string) => {
    try {
      setRegistrationRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: approved ? 'ACTIVE' : 'DEACTIVATED',
                reviewed_at: new Date().toISOString(),
                reviewed_by_user_id: userProfile?.id,
                rejection_reason: rejectionReason
              }
            : req
        )
      );

      toast({
        title: approved ? "تم اعتماد الطلب" : "تم رفض الطلب",
        description: approved ? "تم إرسال رابط التفعيل للمستخدم" : "تم إشعار المستخدم برفض الطلب",
      });
    } catch (error) {
      toast({
        title: "خطأ في معالجة الطلب",
        description: "حدث خطأ أثناء معالجة طلب التسجيل",
        variant: "destructive",
      });
    }
  };

  const handleChangeUserStatus = async (userId: string, newStatus: UserProfile['status']) => {
    try {
      setUserProfiles(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );

      toast({
        title: "تم تحديث حالة المستخدم",
        description: `تم تغيير حالة المستخدم إلى ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث الحالة",
        description: "حدث خطأ أثناء تحديث حالة المستخدم",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      system_admin: 'مدير النظام',
      project_manager: 'مدير المشروع',
      project_consultant: 'مستشار المشروع',
      main_client: 'عميل رئيسي',
      sub_client: 'عميل فرعي'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING_APPROVAL: 'في انتظار الاعتماد',
      INVITED: 'مدعو',
      ACTIVE: 'نشط',
      SUSPENDED: 'معلق',
      DEACTIVATED: 'معطل'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'PENDING_APPROVAL': return 'secondary';
      case 'INVITED': return 'outline';
      case 'SUSPENDED': return 'destructive';
      case 'DEACTIVATED': return 'destructive';
      default: return 'secondary';
    }
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

  if (!canManageUsers()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">غير مصرح بالوصول</h2>
          <p className="text-sm text-muted-foreground mt-2">
            هذا القسم متاح لمدير النظام فقط
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
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        </div>
        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              إنشاء مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء مستخدم جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">الدور الوظيفي</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_admin">مدير النظام</SelectItem>
                    <SelectItem value="project_manager">مدير المشروع</SelectItem>
                    <SelectItem value="project_consultant">مستشار المشروع</SelectItem>
                    <SelectItem value="main_client">عميل رئيسي</SelectItem>
                    <SelectItem value="sub_client">عميل فرعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageToUser">رسالة للمستخدم (اختيارية)</Label>
                <Textarea
                  id="messageToUser"
                  value={newUser.messageToUser}
                  onChange={(e) => setNewUser({ ...newUser, messageToUser: e.target.value })}
                  placeholder="رسالة ترحيبية أو تعليمات"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendEmail"
                  checked={newUser.sendEmail}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, sendEmail: checked })}
                />
                <Label htmlFor="sendEmail">إرسال دعوة بالإيميل</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateUser} className="flex-1">
                  إنشاء المستخدم
                </Button>
                <Button variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            طلبات التسجيل
            <Badge variant="secondary" className="rounded-full text-xs">
              {registrationRequests.filter(r => r.status === 'PENDING_APPROVAL').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            المستخدمين
            <Badge variant="secondary" className="rounded-full text-xs">
              {userProfiles.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            الدعوات
            <Badge variant="secondary" className="rounded-full text-xs">
              {userInvitations.filter(i => i.status === 'SENT').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            سجل النشاط
          </TabsTrigger>
        </TabsList>

        {/* Registration Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                طلبات التسجيل الجديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {registrationRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد طلبات تسجيل حالياً
                    </div>
                  ) : (
                    registrationRequests.map((request) => (
                      <div key={request.id} className="p-4 rounded-lg border bg-muted/20">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{request.full_name}</h3>
                              <Badge variant={getStatusBadgeVariant(request.status)}>
                                {getStatusLabel(request.status)}
                              </Badge>
                              <Badge variant="outline">
                                {getRoleLabel(request.requested_role)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {request.email}
                              </span>
                              {request.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {request.phone}
                                </span>
                              )}
                              {request.organization && (
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {request.organization}
                                </span>
                              )}
                            </div>
                            {request.registration_reason && (
                              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {request.registration_reason}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              تم التقديم {formatTimeAgo(request.submitted_at)}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {request.status === 'PENDING_APPROVAL' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveRequest(request.id, true)}
                                  className="gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  اعتماد
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleApproveRequest(request.id, false, 'لم يتم اعتماد الطلب')}
                                  className="gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  رفض
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRequestDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                جميع المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {userProfiles.map((user) => (
                    <div key={user.id} className="p-4 rounded-lg border bg-muted/20">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.full_name}</h3>
                            <Badge variant={getStatusBadgeVariant(user.status)}>
                              {getStatusLabel(user.status)}
                            </Badge>
                            <Badge variant="outline">
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            {user.last_login_at && (
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                آخر دخول: {formatTimeAgo(user.last_login_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            انضم {formatTimeAgo(user.created_at)}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {user.status === 'ACTIVE' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleChangeUserStatus(user.user_id, 'SUSPENDED')}
                              className="gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              تعليق
                            </Button>
                          )}
                          {user.status === 'SUSPENDED' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleChangeUserStatus(user.user_id, 'ACTIVE')}
                              className="gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              تفعيل
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                دعوات المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {userInvitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد دعوات حالياً
                    </div>
                  ) : (
                    userInvitations.map((invitation) => (
                      <div key={invitation.id} className="p-4 rounded-lg border bg-muted/20">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{invitation.full_name}</h3>
                              <Badge variant={getStatusBadgeVariant(invitation.status)}>
                                {getStatusLabel(invitation.status)}
                              </Badge>
                              <Badge variant="outline">
                                {getRoleLabel(invitation.role)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {invitation.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ينتهي: {new Date(invitation.token_expires_at).toLocaleDateString('ar')}
                              </span>
                            </div>
                            {invitation.message_to_user && (
                              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {invitation.message_to_user}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              تم الإرسال {formatTimeAgo(invitation.created_at)}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {invitation.status === 'SENT' && (
                              <Button size="sm" variant="outline" className="gap-1">
                                <Send className="w-3 h-3" />
                                إعادة إرسال
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                سجل نشاط المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                سيتم إضافة سجل النشاط قريباً
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetailsDialog} onOpenChange={setShowRequestDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب التسجيل</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <p className="text-sm">{selectedRequest.full_name}</p>
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <p className="text-sm">{selectedRequest.email}</p>
              </div>
              {selectedRequest.phone && (
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <p className="text-sm">{selectedRequest.phone}</p>
                </div>
              )}
              {selectedRequest.organization && (
                <div className="space-y-2">
                  <Label>المؤسسة</Label>
                  <p className="text-sm">{selectedRequest.organization}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>الدور المطلوب</Label>
                <p className="text-sm">{getRoleLabel(selectedRequest.requested_role)}</p>
              </div>
              {selectedRequest.registration_reason && (
                <div className="space-y-2">
                  <Label>سبب التسجيل</Label>
                  <p className="text-sm bg-muted/50 p-2 rounded">{selectedRequest.registration_reason}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>تاريخ التقديم</Label>
                <p className="text-sm">{new Date(selectedRequest.submitted_at).toLocaleString('ar')}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    handleApproveRequest(selectedRequest.id, true);
                    setShowRequestDetailsDialog(false);
                  }}
                  className="flex-1 gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  اعتماد
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleApproveRequest(selectedRequest.id, false, 'لم يتم اعتماد الطلب');
                    setShowRequestDetailsDialog(false);
                  }}
                  className="flex-1 gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}