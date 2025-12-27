import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield,
  Users,
  Key,
  Settings,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Activity
} from "lucide-react";

interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PermissionCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Permission {
  id: string;
  code: string;
  category_code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RolePermission {
  id: string;
  role_code: string;
  permission_code: string;
  granted_at: string;
  granted_by?: string;
}

interface UserPermission {
  id: string;
  user_id: string;
  permission_code: string;
  grant_type: 'grant' | 'deny';
  context_type?: string;
  context_id?: string;
  expires_at?: string;
  granted_by: string;
  granted_at: string;
  reason?: string;
  metadata: any;
  created_at: string;
}

interface PermissionAudit {
  id: string;
  target_user_id?: string;
  target_role_code?: string;
  permission_code: string;
  action: 'grant' | 'revoke' | 'update';
  context_type?: string;
  context_id?: string;
  changed_by: string;
  changed_at: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  created_at: string;
}

const RBACManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'assignments' | 'audit'>('roles');
  const [loading, setLoading] = useState(false);
  
  // State for data
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [auditLogs, setAuditLogs] = useState<PermissionAudit[]>([]);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Dialog states
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showUserPermissionDialog, setShowUserPermissionDialog] = useState(false);
  
  // Form states
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [newUserPermission, setNewUserPermission] = useState({
    user_id: '',
    permission_code: '',
    grant_type: 'grant' as 'grant' | 'deny',
    context_type: '',
    context_id: '',
    expires_at: '',
    reason: ''
  });

  useEffect(() => {
    loadRBACData();
  }, []);

  const loadRBACData = async () => {
    setLoading(true);
    
    // محاكاة تحميل البيانات - في التطبيق الحقيقي سيتم جلبها من Supabase
    const mockRoles: Role[] = [
      {
        id: '1',
        code: 'SYSTEM_ADMIN',
        name: 'مدير النظام',
        description: 'تحكم كامل في جميع وظائف النظام',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        code: 'PROJECT_MANAGER',
        name: 'مدير المشروع',
        description: 'رؤية كاملة ضمن المشاريع المخصصة له',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        code: 'CONSULTANT',
        name: 'مستشار',
        description: 'يعمل على المخرجات المخصصة له',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        code: 'SUB_CONSULTANT',
        name: 'مستشار فرعي',
        description: 'يعمل على المخرجات المخصصة عبر التكليفات',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        code: 'CLIENT_MAIN',
        name: 'عميل رئيسي',
        description: 'مراجعة واعتماد المخرجات وإدارة العملاء الفرعيين',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        code: 'CLIENT_SUB',
        name: 'عميل فرعي',
        description: 'مقيد بالمخرجات الممنوحة له',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const mockCategories: PermissionCategory[] = [
      { id: '1', code: 'org_system', name: 'إدارة النظام', description: 'إدارة النظام والمستخدمين والأدوار', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', code: 'clients', name: 'إدارة العملاء', description: 'إنشاء وإدارة العملاء ومستخدميهم', created_at: '2024-01-01T00:00:00Z' },
      { id: '3', code: 'projects', name: 'إدارة المشاريع', description: 'إنشاء وإدارة المشاريع والمراحل والوثائق', created_at: '2024-01-01T00:00:00Z' },
      { id: '4', code: 'deliverables', name: 'إدارة المخرجات', description: 'إنشاء وإدارة المخرجات والتكليفات', created_at: '2024-01-01T00:00:00Z' },
      { id: '5', code: 'versions', name: 'إدارة الإصدارات', description: 'إنشاء وإدارة إصدارات المخرجات', created_at: '2024-01-01T00:00:00Z' },
      { id: '6', code: 'workflow_reviews', name: 'سير عمل المراجعة', description: 'إرسال للمراجعة والاعتماد والتعليقات', created_at: '2024-01-01T00:00:00Z' },
      { id: '7', code: 'reopen', name: 'طلبات إعادة الفتح', description: 'إنشاء والبت في طلبات إعادة فتح المخرجات', created_at: '2024-01-01T00:00:00Z' },
      { id: '8', code: 'grants', name: 'منح الوصول', description: 'منح وإدارة صلاحيات الوصول للمخرجات', created_at: '2024-01-01T00:00:00Z' },
      { id: '9', code: 'messaging', name: 'الرسائل', description: 'إرسال وقراءة الرسائل', created_at: '2024-01-01T00:00:00Z' },
      { id: '10', code: 'meetings', name: 'الاجتماعات', description: 'إنشاء وإدارة الاجتماعات والمحاضر والقرارات', created_at: '2024-01-01T00:00:00Z' },
      { id: '11', code: 'reports_audit', name: 'التقارير والتدقيق', description: 'عرض التقارير وسجلات التدقيق', created_at: '2024-01-01T00:00:00Z' },
      { id: '12', code: 'files', name: 'إدارة الملفات', description: 'رفع وإدارة الملفات', created_at: '2024-01-01T00:00:00Z' }
    ];

    const mockPermissions: Permission[] = [
      // إدارة النظام
      { id: '1', code: 'ORG_READ', category_code: 'org_system', description: 'قراءة تفاصيل المؤسسة', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '2', code: 'ORG_UPDATE', category_code: 'org_system', description: 'تحديث إعدادات المؤسسة', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '3', code: 'USER_CREATE', category_code: 'org_system', description: 'إنشاء مستخدمين', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '4', code: 'USER_READ', category_code: 'org_system', description: 'قراءة المستخدمين', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '5', code: 'USER_UPDATE', category_code: 'org_system', description: 'تحديث المستخدمين', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      
      // إدارة العملاء
      { id: '6', code: 'CLIENT_CREATE', category_code: 'clients', description: 'إنشاء عميل', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '7', code: 'CLIENT_READ', category_code: 'clients', description: 'قراءة العميل', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '8', code: 'CLIENT_UPDATE', category_code: 'clients', description: 'تحديث العميل', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      
      // إدارة المشاريع
      { id: '9', code: 'PROJECT_CREATE', category_code: 'projects', description: 'إنشاء مشروع', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '10', code: 'PROJECT_READ', category_code: 'projects', description: 'قراءة المشروع', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '11', code: 'PROJECT_UPDATE', category_code: 'projects', description: 'تحديث المشروع', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      
      // إدارة المخرجات
      { id: '12', code: 'DELIVERABLE_CREATE', category_code: 'deliverables', description: 'إنشاء مخرج', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '13', code: 'DELIVERABLE_READ', category_code: 'deliverables', description: 'قراءة المخرج', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '14', code: 'DELIVERABLE_UPDATE', category_code: 'deliverables', description: 'تحديث المخرج', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      
      // سير عمل المراجعة
      { id: '15', code: 'REVIEW_READ', category_code: 'workflow_reviews', description: 'قراءة المراجعة', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '16', code: 'REVIEW_APPROVE', category_code: 'workflow_reviews', description: 'اعتماد المخرج', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      
      // الرسائل
      { id: '17', code: 'MESSAGE_READ', category_code: 'messaging', description: 'قراءة الرسائل', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '18', code: 'MESSAGE_SEND', category_code: 'messaging', description: 'إرسال رسالة', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      
      // التقارير والتدقيق
      { id: '19', code: 'AUDIT_LOG_READ', category_code: 'reports_audit', description: 'قراءة سجل التدقيق', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: '20', code: 'AUDIT_LOG_EXPORT', category_code: 'reports_audit', description: 'تصدير سجل التدقيق', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ];

    const mockAuditLogs: PermissionAudit[] = [
      {
        id: '1',
        target_user_id: 'user1',
        permission_code: 'PROJECT_CREATE',
        action: 'grant',
        context_type: 'project',
        context_id: 'proj1',
        changed_by: 'admin1',
        changed_at: '2024-01-20T10:00:00Z',
        reason: 'منح صلاحية إنشاء مشروع جديد',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        target_role_code: 'CONSULTANT',
        permission_code: 'DELIVERABLE_UPDATE',
        action: 'update',
        changed_by: 'admin1',
        changed_at: '2024-01-20T11:00:00Z',
        reason: 'تحديث صلاحيات دور المستشار',
        created_at: '2024-01-20T11:00:00Z'
      }
    ];

    setRoles(mockRoles);
    setCategories(mockCategories);
    setPermissions(mockPermissions);
    setAuditLogs(mockAuditLogs);
    setLoading(false);
  };

  const getCategoryName = (categoryCode: string) => {
    const category = categories.find(c => c.code === categoryCode);
    return category ? category.name : categoryCode;
  };

  const getCategoryColor = (categoryCode: string) => {
    const colors: { [key: string]: string } = {
      'org_system': 'bg-red-100 text-red-800',
      'clients': 'bg-blue-100 text-blue-800',
      'projects': 'bg-green-100 text-green-800',
      'deliverables': 'bg-yellow-100 text-yellow-800',
      'versions': 'bg-purple-100 text-purple-800',
      'workflow_reviews': 'bg-indigo-100 text-indigo-800',
      'reopen': 'bg-pink-100 text-pink-800',
      'grants': 'bg-orange-100 text-orange-800',
      'messaging': 'bg-teal-100 text-teal-800',
      'meetings': 'bg-cyan-100 text-cyan-800',
      'reports_audit': 'bg-gray-100 text-gray-800',
      'files': 'bg-emerald-100 text-emerald-800'
    };
    return colors[categoryCode] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (roleCode: string) => {
    const colors: { [key: string]: string } = {
      'SYSTEM_ADMIN': 'bg-red-100 text-red-800',
      'PROJECT_MANAGER': 'bg-blue-100 text-blue-800',
      'CONSULTANT': 'bg-green-100 text-green-800',
      'SUB_CONSULTANT': 'bg-yellow-100 text-yellow-800',
      'CLIENT_MAIN': 'bg-purple-100 text-purple-800',
      'CLIENT_SUB': 'bg-pink-100 text-pink-800'
    };
    return colors[roleCode] || 'bg-gray-100 text-gray-800';
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = !searchTerm || 
      permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || permission.category_code === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleGrantPermission = async (userId: string, permissionCode: string) => {
    // محاكاة منح صلاحية
    toast({
      title: "تم منح الصلاحية",
      description: `تم منح صلاحية ${permissionCode} للمستخدم بنجاح`,
    });
  };

  const handleRevokePermission = async (userId: string, permissionCode: string) => {
    // محاكاة سحب صلاحية
    toast({
      title: "تم سحب الصلاحية",
      description: `تم سحب صلاحية ${permissionCode} من المستخدم بنجاح`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الأدوار والصلاحيات</h2>
          <p className="text-gray-600 mt-1">
            نظام RBAC متقدم للتحكم الدقيق في صلاحيات المستخدمين
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            الأدوار
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            الصلاحيات
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            التخصيصات
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            سجل التغييرات
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                إدارة الأدوار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getRoleColor(role.code)}>
                              {role.name}
                            </Badge>
                            {role.is_active ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {role.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            الكود: {role.code}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          عرض الصلاحيات
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                إدارة الصلاحيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الصلاحيات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فئة الصلاحيات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.code} value={category.code}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Permissions List */}
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">جاري تحميل الصلاحيات...</p>
                    </div>
                  ) : filteredPermissions.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد صلاحيات</h3>
                      <p className="text-gray-600">لا توجد صلاحيات تطابق الفلاتر المحددة</p>
                    </div>
                  ) : (
                    filteredPermissions.map((permission) => (
                      <Card key={permission.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-gray-900">
                                  {permission.code}
                                </span>
                                <Badge className={getCategoryColor(permission.category_code)}>
                                  {getCategoryName(permission.category_code)}
                                </Badge>
                                {permission.is_active ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              
                              <p className="text-gray-700 mb-2">
                                {permission.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(permission.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                تخصيص الصلاحيات للمستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">تخصيص الصلاحيات</h3>
                <p className="text-gray-600 mb-4">
                  يمكنك هنا منح صلاحيات إضافية للمستخدمين أو منع صلاحيات معينة
                </p>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowUserPermissionDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  إضافة تخصيص جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                سجل تغييرات الصلاحيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <Card key={log.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={
                                log.action === 'grant' ? 'bg-green-100 text-green-800' :
                                log.action === 'revoke' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {log.action === 'grant' && 'منح'}
                                {log.action === 'revoke' && 'سحب'}
                                {log.action === 'update' && 'تحديث'}
                              </Badge>
                              <span className="font-medium text-gray-900">
                                {log.permission_code}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-2">
                              {log.target_user_id && `المستخدم: ${log.target_user_id}`}
                              {log.target_role_code && `الدور: ${log.target_role_code}`}
                            </p>
                            
                            {log.reason && (
                              <p className="text-sm text-gray-600 mb-2">
                                السبب: {log.reason}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>بواسطة: {log.changed_by}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(log.changed_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Permission Assignment Dialog */}
      <Dialog open={showUserPermissionDialog} onOpenChange={setShowUserPermissionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة تخصيص صلاحية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">المستخدم</Label>
              <Input
                id="userId"
                placeholder="معرف المستخدم"
                value={newUserPermission.user_id}
                onChange={(e) => setNewUserPermission({ ...newUserPermission, user_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permissionCode">كود الصلاحية</Label>
              <Select 
                value={newUserPermission.permission_code} 
                onValueChange={(value) => setNewUserPermission({ ...newUserPermission, permission_code: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصلاحية" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map((permission) => (
                    <SelectItem key={permission.code} value={permission.code}>
                      {permission.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grantType">نوع التخصيص</Label>
              <Select 
                value={newUserPermission.grant_type} 
                onValueChange={(value: 'grant' | 'deny') => setNewUserPermission({ ...newUserPermission, grant_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grant">منح</SelectItem>
                  <SelectItem value="deny">منع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">السبب</Label>
              <Input
                id="reason"
                placeholder="سبب التخصيص"
                value={newUserPermission.reason}
                onChange={(e) => setNewUserPermission({ ...newUserPermission, reason: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  // Add user permission logic here
                  toast({
                    title: "تم إضافة التخصيص",
                    description: "تم إضافة تخصيص الصلاحية بنجاح",
                  });
                  setShowUserPermissionDialog(false);
                  setNewUserPermission({
                    user_id: '',
                    permission_code: '',
                    grant_type: 'grant',
                    context_type: '',
                    context_id: '',
                    expires_at: '',
                    reason: ''
                  });
                }}
                className="flex-1"
              >
                إضافة التخصيص
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowUserPermissionDialog(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RBACManagement;