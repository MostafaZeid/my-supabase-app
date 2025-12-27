import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Plus, 
  Edit,
  Trash2,
  Search,
  Filter,
  User,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Award,
  Users
} from "lucide-react";
import DeliverableVersionsManager from "@/components/advanced-projects/DeliverableVersionsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectDeliverable {
  id: string;
  project_id: string;
  phase_id?: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  deliverable_code?: string;
  
  // المستشار المسؤول
  assigned_consultant_id?: string;
  assigned_consultant_email?: string;
  assigned_consultant_name?: string;
  consultant_role?: string;
  consultant_role_en?: string;
  
  // الجدول الزمني
  start_date: string;
  end_date: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  
  // الوزن النسبي والتقدم
  weight_percentage: number;
  progress_percentage: number;
  quality_score: number;
  
  // الحالة والأولوية
  status: 'draft' | 'assigned' | 'in_progress' | 'submitted' | 'under_review' | 'revision_requested' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // معلومات إضافية
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface ProjectTeamMember {
  id: string;
  consultant_id: string;
  consultant_name: string;
  consultant_email: string;
  project_role: string;
  specialization: string;
}

interface ProjectDeliverablesManagerProps {
  projectId: string;
  projectName: string;
}

const ProjectDeliverablesManager: React.FC<ProjectDeliverablesManagerProps> = ({ projectId, projectName }) => {
  const { toast } = useToast();
  const [deliverables, setDeliverables] = useState<ProjectDeliverable[]>([]);
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<ProjectDeliverable | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeliverable, setSelectedDeliverable] = useState<ProjectDeliverable | null>(null);
  const [showVersionsManager, setShowVersionsManager] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    deliverable_code: '',
    assigned_consultant_id: '',
    consultant_role: '',
    consultant_role_en: '',
    start_date: '',
    end_date: '',
    weight_percentage: 0,
    priority: 'medium' as const,
    status: 'draft' as const
  });

  useEffect(() => {
    loadDeliverables();
    loadTeamMembers();
  }, [projectId]);

  const loadDeliverables = async () => {
    setLoading(true);
    // محاكاة بيانات المخرجات
    const mockDeliverables: ProjectDeliverable[] = [
      {
        id: '1',
        project_id: projectId,
        title: 'تصميم واجهة المستخدم الرئيسية',
        title_en: 'Main User Interface Design',
        description: 'تصميم شامل لواجهة المستخدم الرئيسية للتطبيق مع جميع الشاشات والتفاعلات',
        description_en: 'Comprehensive design for the main user interface including all screens and interactions',
        deliverable_code: 'DEL001',
        assigned_consultant_id: 'c2',
        assigned_consultant_name: 'سارة أحمد علي',
        assigned_consultant_email: 'sara.ahmed@company.com',
        consultant_role: 'مصمم واجهات رئيسي',
        consultant_role_en: 'Lead UI/UX Designer',
        start_date: '2024-01-15',
        end_date: '2024-02-15',
        planned_start_date: '2024-01-15',
        planned_end_date: '2024-02-15',
        weight_percentage: 25,
        progress_percentage: 75,
        quality_score: 0,
        status: 'in_progress',
        priority: 'high',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        project_id: projectId,
        title: 'تطوير قاعدة البيانات',
        title_en: 'Database Development',
        description: 'تصميم وتطوير قاعدة البيانات مع جميع الجداول والعلاقات المطلوبة',
        description_en: 'Design and develop database with all required tables and relationships',
        deliverable_code: 'DEL002',
        assigned_consultant_id: 'c1',
        assigned_consultant_name: 'أحمد محمد السعيد',
        assigned_consultant_email: 'ahmed.mohamed@company.com',
        consultant_role: 'مطور قواعد البيانات',
        consultant_role_en: 'Database Developer',
        start_date: '2024-01-20',
        end_date: '2024-02-20',
        planned_start_date: '2024-01-20',
        planned_end_date: '2024-02-20',
        weight_percentage: 30,
        progress_percentage: 45,
        quality_score: 0,
        status: 'assigned',
        priority: 'medium',
        created_at: '2024-01-12T09:00:00Z',
        updated_at: '2024-01-18T11:15:00Z'
      }
    ];
    setDeliverables(mockDeliverables);
    setLoading(false);
  };

  const loadTeamMembers = async () => {
    // محاكاة بيانات أعضاء الفريق
    const mockTeamMembers: ProjectTeamMember[] = [
      {
        id: '1',
        consultant_id: 'c1',
        consultant_name: 'أحمد محمد السعيد',
        consultant_email: 'ahmed.mohamed@company.com',
        project_role: 'مطور رئيسي',
        specialization: 'تطوير البرمجيات'
      },
      {
        id: '2',
        consultant_id: 'c2',
        consultant_name: 'سارة أحمد علي',
        consultant_email: 'sara.ahmed@company.com',
        project_role: 'مصمم واجهات',
        specialization: 'تصميم واجهات المستخدم'
      },
      {
        id: '3',
        consultant_id: 'c3',
        consultant_name: 'محمد علي حسن',
        consultant_email: 'mohamed.ali@company.com',
        project_role: 'مدير المشروع',
        specialization: 'إدارة المشاريع'
      }
    ];
    setTeamMembers(mockTeamMembers);
  };

  const handleAddDeliverable = async () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) {
      toast({
        title: "خطأ",
        description: "يجب إدخال عنوان المخرج وتواريخ البداية والانتهاء",
        variant: "destructive"
      });
      return;
    }

    if (formData.weight_percentage <= 0 || formData.weight_percentage > 100) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون الوزن النسبي بين 1 و 100",
        variant: "destructive"
      });
      return;
    }

    const assignedConsultant = teamMembers.find(m => m.consultant_id === formData.assigned_consultant_id);

    const newDeliverable: ProjectDeliverable = {
      id: Date.now().toString(),
      project_id: projectId,
      title: formData.title,
      title_en: formData.title_en,
      description: formData.description,
      description_en: formData.description_en,
      deliverable_code: formData.deliverable_code || `DEL${String(deliverables.length + 1).padStart(3, '0')}`,
      assigned_consultant_id: formData.assigned_consultant_id,
      assigned_consultant_name: assignedConsultant?.consultant_name,
      assigned_consultant_email: assignedConsultant?.consultant_email,
      consultant_role: formData.consultant_role,
      consultant_role_en: formData.consultant_role_en,
      start_date: formData.start_date,
      end_date: formData.end_date,
      planned_start_date: formData.start_date,
      planned_end_date: formData.end_date,
      weight_percentage: formData.weight_percentage,
      progress_percentage: 0,
      quality_score: 0,
      status: formData.assigned_consultant_id ? 'assigned' : 'draft',
      priority: formData.priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setDeliverables([...deliverables, newDeliverable]);
    setShowAddDialog(false);
    resetForm();

    toast({
      title: "تم إضافة المخرج",
      description: `تم إضافة المخرج "${newDeliverable.title}" بنجاح`,
    });
  };

  const handleEditDeliverable = (deliverable: ProjectDeliverable) => {
    setEditingDeliverable(deliverable);
    setFormData({
      title: deliverable.title,
      title_en: deliverable.title_en || '',
      description: deliverable.description,
      description_en: deliverable.description_en || '',
      deliverable_code: deliverable.deliverable_code || '',
      assigned_consultant_id: deliverable.assigned_consultant_id || '',
      consultant_role: deliverable.consultant_role || '',
      consultant_role_en: deliverable.consultant_role_en || '',
      start_date: deliverable.start_date,
      end_date: deliverable.end_date,
      weight_percentage: deliverable.weight_percentage,
      priority: deliverable.priority,
      status: deliverable.status
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDeliverable || !formData.title.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال عنوان المخرج",
        variant: "destructive"
      });
      return;
    }

    const assignedConsultant = teamMembers.find(m => m.consultant_id === formData.assigned_consultant_id);

    const updatedDeliverables = deliverables.map(deliverable =>
      deliverable.id === editingDeliverable.id
        ? {
            ...deliverable,
            title: formData.title,
            title_en: formData.title_en,
            description: formData.description,
            description_en: formData.description_en,
            deliverable_code: formData.deliverable_code,
            assigned_consultant_id: formData.assigned_consultant_id,
            assigned_consultant_name: assignedConsultant?.consultant_name,
            assigned_consultant_email: assignedConsultant?.consultant_email,
            consultant_role: formData.consultant_role,
            consultant_role_en: formData.consultant_role_en,
            start_date: formData.start_date,
            end_date: formData.end_date,
            weight_percentage: formData.weight_percentage,
            priority: formData.priority,
            status: formData.status,
            updated_at: new Date().toISOString()
          }
        : deliverable
    );

    setDeliverables(updatedDeliverables);
    setShowEditDialog(false);
    setEditingDeliverable(null);
    resetForm();

    toast({
      title: "تم تحديث المخرج",
      description: `تم تحديث المخرج "${formData.title}" بنجاح`,
    });
  };

  const handleDeleteDeliverable = async (deliverable: ProjectDeliverable) => {
    const updatedDeliverables = deliverables.filter(d => d.id !== deliverable.id);
    setDeliverables(updatedDeliverables);

    toast({
      title: "تم حذف المخرج",
      description: `تم حذف المخرج "${deliverable.title}" بنجاح`,
    });
  };

  const handleManageVersions = (deliverable: ProjectDeliverable) => {
    setSelectedDeliverable(deliverable);
    setShowVersionsManager(true);
  };

  const handleBackFromVersions = () => {
    setShowVersionsManager(false);
    setSelectedDeliverable(null);
  };

  const handleSubmitForReview = (deliverable: ProjectDeliverable) => {
    // تحديث حالة المخرج إلى "مرسل للمراجعة"
    const updatedDeliverables = deliverables.map(d => 
      d.id === deliverable.id 
        ? { ...d, status: 'submitted' as const }
        : d
    );
    setDeliverables(updatedDeliverables);

    toast({
      title: "تم إرسال المخرج للمراجعة",
      description: `تم إرسال المخرج "${deliverable.title}" للمراجعة بنجاح`,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      deliverable_code: '',
      assigned_consultant_id: '',
      consultant_role: '',
      consultant_role_en: '',
      start_date: '',
      end_date: '',
      weight_percentage: 0,
      priority: 'medium',
      status: 'draft'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'revision_requested': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'assigned': return 'مُسند';
      case 'in_progress': return 'قيد التنفيذ';
      case 'submitted': return 'مُرسل';
      case 'under_review': return 'قيد المراجعة';
      case 'revision_requested': return 'مطلوب تعديل';
      case 'approved': return 'معتمد';
      case 'rejected': return 'مرفوض';
      default: return 'غير محدد';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'عالية';
      case 'urgent': return 'عاجلة';
      default: return 'غير محدد';
    }
  };

  const filteredDeliverables = deliverables.filter(deliverable => {
    const matchesSearch = deliverable.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliverable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (deliverable.assigned_consultant_name && deliverable.assigned_consultant_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || deliverable.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalWeight = deliverables.reduce((sum, d) => sum + d.weight_percentage, 0);
  const averageProgress = deliverables.length > 0 
    ? deliverables.reduce((sum, d) => sum + (d.progress_percentage * d.weight_percentage / 100), 0) / (totalWeight / 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مخرجات المشروع</h2>
          <p className="text-gray-600 mt-1">إدارة المخرجات وتعيين المسؤولين للمشروع: {projectName}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مخرج جديد
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{deliverables.length}</div>
                <div className="text-sm text-gray-600">إجمالي المخرجات</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {deliverables.filter(d => d.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">مخرجات معتمدة</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {deliverables.filter(d => d.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">قيد التنفيذ</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(averageProgress)}%</div>
                <div className="text-sm text-gray-600">التقدم العام</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث في المخرجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
            <SelectItem value="assigned">مُسند</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="submitted">مُرسل</SelectItem>
            <SelectItem value="under_review">قيد المراجعة</SelectItem>
            <SelectItem value="approved">معتمد</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Weight Summary */}
      {totalWeight !== 100 && deliverables.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">تنبيه:</span>
              <span>إجمالي الأوزان النسبية للمخرجات هو {totalWeight}% (يجب أن يكون 100%)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliverables List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">جاري تحميل المخرجات...</p>
          </div>
        ) : filteredDeliverables.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مخرجات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة المخرجات المطلوبة للمشروع</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول مخرج
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredDeliverables.map((deliverable) => (
            <Card key={deliverable.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {deliverable.title}
                      </h3>
                      <Badge className={getStatusColor(deliverable.status)}>
                        {getStatusText(deliverable.status)}
                      </Badge>
                      <Badge className={getPriorityColor(deliverable.priority)}>
                        {getPriorityText(deliverable.priority)}
                      </Badge>
                    </div>
                    
                    {deliverable.deliverable_code && (
                      <div className="text-sm text-gray-500 mb-2">
                        كود المخرج: {deliverable.deliverable_code}
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-3">{deliverable.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {deliverable.assigned_consultant_name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">المسؤول:</span>
                          <span>{deliverable.assigned_consultant_name}</span>
                        </div>
                      )}
                      
                      {deliverable.consultant_role && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">الدور:</span>
                          <span>{deliverable.consultant_role}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">المدة:</span>
                        <span>{deliverable.start_date} - {deliverable.end_date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">الوزن:</span>
                        <span>{deliverable.weight_percentage}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>التقدم</span>
                        <span>{deliverable.progress_percentage}%</span>
                      </div>
                      <Progress value={deliverable.progress_percentage} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDeliverable(deliverable)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageVersions(deliverable)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmitForReview(deliverable)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDeliverable(deliverable)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Deliverable Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مخرج جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المخرج *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="أدخل عنوان المخرج"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title-en">العنوان (بالإنجليزية)</Label>
                <Input
                  id="title-en"
                  value={formData.title_en}
                  onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  placeholder="Enter title in English"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">وصف المخرج</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="وصف مفصل للمخرج"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-en">الوصف (بالإنجليزية)</Label>
                <Textarea
                  id="description-en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  placeholder="Detailed description in English"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliverable-code">كود المخرج</Label>
                <Input
                  id="deliverable-code"
                  value={formData.deliverable_code}
                  onChange={(e) => setFormData({...formData, deliverable_code: e.target.value})}
                  placeholder="DEL001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">الوزن النسبي (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.weight_percentage}
                  onChange={(e) => setFormData({...formData, weight_percentage: Number(e.target.value)})}
                  placeholder="25"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">تاريخ البداية *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">تاريخ الانتهاء *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">تعيين المسؤول</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultant">المستشار المسؤول</Label>
                  <Select value={formData.assigned_consultant_id} onValueChange={(value) => setFormData({...formData, assigned_consultant_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستشار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون تعيين</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.consultant_id} value={member.consultant_id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.consultant_name}</span>
                            <span className="text-sm text-gray-500">({member.specialization})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consultant-role">دور المستشار في هذا المخرج</Label>
                  <Input
                    id="consultant-role"
                    value={formData.consultant_role}
                    onChange={(e) => setFormData({...formData, consultant_role: e.target.value})}
                    placeholder="مثال: مطور رئيسي، مصمم واجهات"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="consultant-role-en">الدور (بالإنجليزية)</Label>
                <Input
                  id="consultant-role-en"
                  value={formData.consultant_role_en}
                  onChange={(e) => setFormData({...formData, consultant_role_en: e.target.value})}
                  placeholder="Lead Developer, UI Designer"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddDeliverable}>
              إضافة المخرج
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Deliverable Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تحرير المخرج</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">عنوان المخرج *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="أدخل عنوان المخرج"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title-en">العنوان (بالإنجليزية)</Label>
                <Input
                  id="edit-title-en"
                  value={formData.title_en}
                  onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  placeholder="Enter title in English"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">وصف المخرج</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="وصف مفصل للمخرج"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description-en">الوصف (بالإنجليزية)</Label>
                <Textarea
                  id="edit-description-en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  placeholder="Detailed description in English"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-deliverable-code">كود المخرج</Label>
                <Input
                  id="edit-deliverable-code"
                  value={formData.deliverable_code}
                  onChange={(e) => setFormData({...formData, deliverable_code: e.target.value})}
                  placeholder="DEL001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="assigned">مُسند</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="submitted">مُرسل</SelectItem>
                    <SelectItem value="under_review">قيد المراجعة</SelectItem>
                    <SelectItem value="approved">معتمد</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">الأولوية</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-weight">الوزن النسبي (%)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.weight_percentage}
                  onChange={(e) => setFormData({...formData, weight_percentage: Number(e.target.value)})}
                  placeholder="25"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">تاريخ البداية *</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">تاريخ الانتهاء *</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">تعيين المسؤول</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-consultant">المستشار المسؤول</Label>
                  <Select value={formData.assigned_consultant_id} onValueChange={(value) => setFormData({...formData, assigned_consultant_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستشار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون تعيين</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.consultant_id} value={member.consultant_id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.consultant_name}</span>
                            <span className="text-sm text-gray-500">({member.specialization})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-consultant-role">دور المستشار في هذا المخرج</Label>
                  <Input
                    id="edit-consultant-role"
                    value={formData.consultant_role}
                    onChange={(e) => setFormData({...formData, consultant_role: e.target.value})}
                    placeholder="مثال: مطور رئيسي، مصمم واجهات"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-consultant-role-en">الدور (بالإنجليزية)</Label>
                <Input
                  id="edit-consultant-role-en"
                  value={formData.consultant_role_en}
                  onChange={(e) => setFormData({...formData, consultant_role_en: e.target.value})}
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

      {/* Versions Manager */}
      {showVersionsManager && selectedDeliverable && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="container mx-auto py-6">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={handleBackFromVersions}
                className="mb-4"
              >
                ← العودة إلى المخرجات
              </Button>
            </div>
            <DeliverableVersionsManager 
              deliverableId={selectedDeliverable.id}
              deliverableName={selectedDeliverable.title}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDeliverablesManager;