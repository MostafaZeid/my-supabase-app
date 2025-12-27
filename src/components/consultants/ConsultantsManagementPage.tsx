import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Award,
  FileText,
  Camera,
  Save,
  X,
  Users,
  Briefcase,
  GraduationCap,
  Download,
  Paperclip,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { consultantsApiService, Consultant } from '@/services/consultantsApiService';
import { toast } from '@/hooks/use-toast';

// Consultant interface is now imported from service

export function ConsultantsManagementPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [consultantStats, setConsultantStats] = useState<any>(null);
  
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  const fetchConsultants = async (page = 1, search = '', availability = '', specialization = '') => {
    try {
      setLoading(true);
      const response = await consultantsApiService.getConsultants({
        page,
        limit: 10,
        search,
        status: availability === 'all' ? undefined : availability,
        department: specialization === 'all' ? undefined : specialization
      });
      
      if (response.success) {
        setConsultants(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
        if (response.stats) {
          setConsultantStats(response.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching consultants:', error);
      toast({
        title: t('common.error'),
        description: 'فشل في تحميل بيانات الاستشاريين',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants(currentPage, searchTerm, availabilityFilter, specializationFilter);
  }, [currentPage, availabilityFilter, specializationFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchConsultants(1, searchTerm, availabilityFilter, specializationFilter);
  };

  const handleCreateConsultant = async (consultantData: any) => {
    try {
      const response = await consultantsApiService.createConsultant(consultantData);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم إنشاء الاستشاري بنجاح'
        });
        setShowCreateModal(false);
        fetchConsultants(currentPage, searchTerm, availabilityFilter, specializationFilter);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في إنشاء الاستشاري',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateConsultant = async (consultantData: any) => {
    if (!selectedConsultant) return;
    
    try {
      const response = await consultantsApiService.updateConsultant(selectedConsultant.id, consultantData);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم تحديث بيانات الاستشاري بنجاح'
        });
        setShowEditModal(false);
        setSelectedConsultant(null);
        fetchConsultants(currentPage, searchTerm, availabilityFilter, specializationFilter);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في تحديث بيانات الاستشاري',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteConsultant = async (consultantId: string) => {
    try {
      const response = await consultantsApiService.deleteConsultant(consultantId);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم حذف الاستشاري بنجاح'
        });
        fetchConsultants(currentPage, searchTerm, availabilityFilter, specializationFilter);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في حذف الاستشاري',
        variant: 'destructive'
      });
    }
  };

  const getAvailabilityBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'نشط', color: 'bg-green-100 text-green-800' },
      'inactive': { label: 'غير نشط', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['active'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading && consultants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل الاستشاريين...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الاستشاريين</h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة الاستشاريين ومهاراتهم
          </p>
        </div>
        
        {hasPermission('create_consultant') && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة استشاري
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {consultantStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الاستشاريين</p>
                  <p className="text-2xl font-bold">{consultantStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">متاحين</p>
                  <p className="text-2xl font-bold">{consultantStats.available}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">مشغولين</p>
                  <p className="text-2xl font-bold">{consultantStats.busy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الأجر</p>
                  <p className="text-2xl font-bold">{Math.round(consultantStats.avgHourlyRate)} ريال</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="بحث في الاستشاريين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب التوفر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="busy">مشغول</SelectItem>
                <SelectItem value="unavailable">غير متاح</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch} variant="outline">
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultants.map((consultant) => (
          <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {consultant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{consultant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{consultant.specialization}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedConsultant(consultant);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {hasPermission('edit_consultant') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedConsultant(consultant);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {hasPermission('delete_consultant') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteConsultant(consultant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{consultant.email}</span>
              </div>
              
              {consultant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{consultant.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{consultant.experience_years} سنوات خبرة</span>
              </div>
              
              {consultant.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{consultant.department}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2">
                {getAvailabilityBadge(consultant.status)}
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedConsultant(consultant);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  {hasPermission('update_consultant') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedConsultant(consultant);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {hasPermission('delete_consultant') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteConsultant(consultant.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <span className="text-sm text-muted-foreground">
            صفحة {currentPage} من {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Create Consultant Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              إضافة استشاري جديد
            </DialogTitle>
          </DialogHeader>
          <CreateConsultantForm
            onSubmit={handleCreateConsultant}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Consultant Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تعديل بيانات الاستشاري
            </DialogTitle>
          </DialogHeader>
          {selectedConsultant && (
            <EditConsultantForm
              consultant={selectedConsultant}
              onSubmit={handleUpdateConsultant}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Consultant Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تفاصيل الاستشاري
            </DialogTitle>
          </DialogHeader>
          {selectedConsultant && (
            <ConsultantDetailsView consultant={selectedConsultant} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Consultant Form Component
function CreateConsultantForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    full_name: '',
    full_name_en: '',
    email: '',
    phone: '',
    position: '',
    position_en: '',
    department: '',
    department_en: '',
    specialization: '',
    specialization_en: '',
    experience_years: 0,
    biography: '',
    biography_en: '',
    location: '',
    location_en: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">الاسم الكامل (عربي)</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="full_name_en">الاسم الكامل (إنجليزي)</Label>
          <Input
            id="full_name_en"
            value={formData.full_name_en}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name_en: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">المنصب (عربي)</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="position_en">المنصب (إنجليزي)</Label>
          <Input
            id="position_en"
            value={formData.position_en}
            onChange={(e) => setFormData(prev => ({ ...prev, position_en: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">القسم (عربي)</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="department_en">القسم (إنجليزي)</Label>
          <Input
            id="department_en"
            value={formData.department_en}
            onChange={(e) => setFormData(prev => ({ ...prev, department_en: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="specialization">التخصص (عربي)</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="specialization_en">التخصص (إنجليزي)</Label>
          <Input
            id="specialization_en"
            value={formData.specialization_en}
            onChange={(e) => setFormData(prev => ({ ...prev, specialization_en: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="experience_years">سنوات الخبرة</Label>
        <Input
          id="experience_years"
          type="number"
          min="0"
          value={formData.experience_years}
          onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
        />
      </div>

      <div>
        <Label htmlFor="biography">السيرة الذاتية (عربي)</Label>
        <Textarea
          id="biography"
          value={formData.biography}
          onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="biography_en">السيرة الذاتية (إنجليزي)</Label>
        <Textarea
          id="biography_en"
          value={formData.biography_en}
          onChange={(e) => setFormData(prev => ({ ...prev, biography_en: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          حفظ
        </Button>
      </div>
    </form>
  );
}

// Edit Consultant Form Component
function EditConsultantForm({ consultant, onSubmit, onCancel }: { consultant: Consultant; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    full_name: consultant.full_name || '',
    full_name_en: consultant.full_name_en || '',
    email: consultant.email || '',
    phone: consultant.phone || '',
    position: consultant.position || '',
    position_en: consultant.position_en || '',
    department: consultant.department || '',
    department_en: consultant.department_en || '',
    specialization: consultant.specialization || '',
    specialization_en: consultant.specialization_en || '',
    experience_years: consultant.experience_years || 0,
    biography: consultant.biography || '',
    biography_en: consultant.biography_en || '',
    location: consultant.location || '',
    location_en: consultant.location_en || '',
    status: consultant.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_full_name">الاسم الكامل (عربي)</Label>
          <Input
            id="edit_full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit_full_name_en">الاسم الكامل (إنجليزي)</Label>
          <Input
            id="edit_full_name_en"
            value={formData.full_name_en}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name_en: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_email">البريد الإلكتروني</Label>
          <Input
            id="edit_email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit_phone">رقم الهاتف</Label>
          <Input
            id="edit_phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit_status">الحالة</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          تحديث
        </Button>
      </div>
    </form>
  );
}

// Consultant Details View Component
function ConsultantDetailsView({ consultant }: { consultant: Consultant }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={consultant.profile_image} />
          <AvatarFallback className="text-lg">
            {consultant.avatar_initials || consultant.full_name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-bold">{consultant.full_name}</h3>
          <p className="text-muted-foreground">{consultant.position}</p>
          <Badge className={consultant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {consultant.status === 'active' ? 'نشط' : 'غير نشط'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">معلومات الاتصال</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{consultant.email}</span>
              </div>
              {consultant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{consultant.phone}</span>
                </div>
              )}
              {consultant.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{consultant.location}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">معلومات مهنية</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{consultant.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{consultant.specialization}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{consultant.experience_years} سنوات خبرة</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">السيرة الذاتية</h4>
          <p className="text-muted-foreground leading-relaxed">
            {consultant.biography || 'لا توجد سيرة ذاتية متاحة'}
          </p>
        </div>
      </div>
    </div>
  );
}
