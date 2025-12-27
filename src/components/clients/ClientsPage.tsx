import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  Search, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateClientModal } from './CreateClientModal';
import { ClientDetailsModal } from './ClientDetailsModal';
import { EditClientModal } from './EditClientModal';
import { ClientActionsMenu } from './ClientActionsMenu';
import { ClientProjectsModal } from './ClientProjectsModal';
import { clientsApiService, Client } from '@/services/clientsApiService';
import { toast } from '@/hooks/use-toast';

// Client interface is now imported from service

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  const fetchClients = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await clientsApiService.getClients({
        page,
        limit: 10,
        search
      });
      
      if (response.success) {
        setClients(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: t('common.error'),
        description: 'فشل في تحميل بيانات العملاء',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients(1, searchTerm);
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      const response = await clientsApiService.createClient(clientData);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم إنشاء العميل بنجاح'
        });
        setShowCreateModal(false);
        fetchClients(currentPage, searchTerm);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في إنشاء العميل',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateClient = async (clientData: any) => {
    if (!selectedClient) return;
    
    try {
      const response = await clientsApiService.updateClient(selectedClient.id, clientData);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم تحديث بيانات العميل بنجاح'
        });
        setShowEditModal(false);
        setSelectedClient(null);
        fetchClients(currentPage, searchTerm);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في تحديث بيانات العميل',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await clientsApiService.deleteClient(clientId);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم حذف العميل بنجاح'
        });
        fetchClients(currentPage, searchTerm);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في حذف العميل',
        variant: 'destructive'
      });
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل العملاء...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('clients.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('clients.subtitle')}
          </p>
        </div>
        
        {hasPermission('create_client') && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('clients.addNew')}
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('clients.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} variant="outline">
              {t('common.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {client.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {client.company && (
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                    )}
                  </div>
                </div>
                
                <ClientActionsMenu
                  client={client}
                  onView={() => {
                    setSelectedClient(client);
                    setShowDetailsModal(true);
                  }}
                  onEdit={() => {
                    setSelectedClient(client);
                    setShowEditModal(true);
                  }}
                  onDelete={() => handleDeleteClient(client.id)}
                  onViewProjects={() => {
                    setSelectedClient(client);
                    setShowProjectsModal(true);
                  }}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              
              {client.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{client.address}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(client.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Badge variant={client.is_active ? 'default' : 'secondary'}>
                  {client.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
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
            {t('common.previous')}
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {t('common.page')} {currentPage} {t('common.of')} {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateClientModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateClient}
      />
      
      {selectedClient && (
        <>
          <ClientDetailsModal
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            client={selectedClient}
          />
          
          <EditClientModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            client={selectedClient}
            onSubmit={handleUpdateClient}
          />
          
          <ClientProjectsModal
            open={showProjectsModal}
            onOpenChange={setShowProjectsModal}
            client={selectedClient}
          />
        </>
      )}
    </div>
  );
}
    cityEn: string;
    country: string;
    countryEn: string;
  };
  establishedDate: string;
  clientSince: string;
  status: 'active' | 'inactive' | 'prospect';
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  totalValue: number;
  paidValue: number;
  satisfaction: number;
  lastActivity: string;
  tags: string[];
  tagsEn: string[];
}

export function ClientsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { language, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  // بيانات العملاء الشاملة
  const allClients: Client[] = [
    {
      id: '1',
      organization: 'شركة منصور القابضة',
      organizationEn: 'Mansour Holding Company',
      industry: 'الاستثمار والتطوير',
      industryEn: 'Investment & Development',
      contactPerson: {
        name: 'سلطان منصور',
        nameEn: 'Sultan Mansour',
        position: 'مدير عام',
        positionEn: 'General Manager',
        email: 'sultan.mansour@mansourholding.sa',
        phone: '+966501234567',
        avatar: 'SM'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2015-03-15',
      clientSince: '2024-01-15',
      status: 'active',
      projects: {
        total: 3,
        active: 2,
        completed: 1,
        onHold: 0
      },
      totalValue: 1250000,
      paidValue: 950000,
      satisfaction: 92,
      lastActivity: '2024-10-30',
      tags: ['تقنية', 'موارد بشرية', 'شركة كبيرة'],
      tagsEn: ['Technology', 'HR', 'Large Company']
    },
    {
      id: '2',
      organization: 'شركة تمنكو',
      organizationEn: 'Tamnco Company',
      industry: 'الهندسة والإنشاء',
      industryEn: 'Engineering & Construction',
      contactPerson: {
        name: 'المهندس تركي آل نصيب',
        nameEn: 'Eng. Turki Al Naseeb',
        position: 'مدير عام',
        positionEn: 'General Manager',
        email: 'turki.alnaseeb@tamnco.sa',
        phone: '+966502345678',
        avatar: 'TN'
      },
      address: {
        city: 'جدة',
        cityEn: 'Jeddah',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2008-11-20',
      clientSince: '2024-02-01',
      status: 'active',
      projects: {
        total: 2,
        active: 1,
        completed: 0,
        onHold: 1
      },
      totalValue: 850000,
      paidValue: 425000,
      satisfaction: 88,
      lastActivity: '2024-10-29',
      tags: ['استثمار', 'مالية', 'مجموعة'],
      tagsEn: ['Investment', 'Finance', 'Group']
    },
    {
      id: '3',
      organization: 'البنك التجاري الوطني',
      organizationEn: 'National Commercial Bank',
      industry: 'الخدمات المصرفية',
      industryEn: 'Banking Services',
      contactPerson: {
        name: 'عبدالرحمن الغامدي',
        nameEn: 'Abdulrahman Al-Ghamdi',
        position: 'مدير الامتثال والحوكمة',
        positionEn: 'Compliance and Governance Director',
        email: 'a.ghamdi@ncb.sa',
        phone: '+966503456789',
        avatar: 'AG'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1953-12-20',
      clientSince: '2024-03-10',
      status: 'active',
      projects: {
        total: 1,
        active: 0,
        completed: 0,
        onHold: 0
      },
      totalValue: 520000,
      paidValue: 78000,
      satisfaction: 95,
      lastActivity: '2024-10-28',
      tags: ['بنك', 'حوكمة', 'امتثال'],
      tagsEn: ['Bank', 'Governance', 'Compliance']
    },
    {
      id: '4',
      organization: 'شركة الاتصالات الرقمية',
      organizationEn: 'Digital Communications Company',
      industry: 'الاتصالات وتقنية المعلومات',
      industryEn: 'Telecommunications & IT',
      contactPerson: {
        name: 'لينا الخالد',
        nameEn: 'Lina Al-Khalid',
        position: 'مدير أمن المعلومات',
        positionEn: 'Information Security Manager',
        email: 'lina.khalid@dcc.sa',
        phone: '+966504567890',
        avatar: 'LK'
      },
      address: {
        city: 'الدمام',
        cityEn: 'Dammam',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2010-06-15',
      clientSince: '2024-04-20',
      status: 'active',
      projects: {
        total: 2,
        active: 1,
        completed: 1,
        onHold: 0
      },
      totalValue: 680000,
      paidValue: 510000,
      satisfaction: 90,
      lastActivity: '2024-10-31',
      tags: ['اتصالات', 'أمن سيبراني', 'تقنية'],
      tagsEn: ['Telecom', 'Cybersecurity', 'Technology']
    },
    {
      id: '5',
      organization: 'مجموعة الخدمات اللوجستية',
      organizationEn: 'Logistics Services Group',
      industry: 'الخدمات اللوجستية',
      industryEn: 'Logistics Services',
      contactPerson: {
        name: 'صالح الدوسري',
        nameEn: 'Saleh Al-Dosari',
        position: 'المدير التنفيذي',
        positionEn: 'Chief Executive Officer',
        email: 'saleh.dosari@lsg.sa',
        phone: '+966505678901',
        avatar: 'SD'
      },
      address: {
        city: 'جدة',
        cityEn: 'Jeddah',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2012-09-10',
      clientSince: '2024-01-05',
      status: 'active',
      projects: {
        total: 1,
        active: 0,
        completed: 1,
        onHold: 0
      },
      totalValue: 340000,
      paidValue: 340000,
      satisfaction: 96,
      lastActivity: '2024-10-25',
      tags: ['لوجستيات', 'نقل', 'خدمات'],
      tagsEn: ['Logistics', 'Transportation', 'Services']
    },
    {
      id: '6',
      organization: 'شركة التأمين الوطنية',
      organizationEn: 'National Insurance Company',
      industry: 'التأمين',
      industryEn: 'Insurance',
      contactPerson: {
        name: 'فهد العنزي',
        nameEn: 'Fahd Al-Anzi',
        position: 'مدير إدارة المخاطر',
        positionEn: 'Risk Management Director',
        email: 'fahd.anzi@nic.sa',
        phone: '+966506789012',
        avatar: 'FA'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2005-04-25',
      clientSince: '2024-05-15',
      status: 'prospect',
      projects: {
        total: 1,
        active: 0,
        completed: 0,
        onHold: 1
      },
      totalValue: 410000,
      paidValue: 102500,
      satisfaction: 85,
      lastActivity: '2024-10-20',
      tags: ['تأمين', 'مخاطر', 'مالية'],
      tagsEn: ['Insurance', 'Risk', 'Finance']
    },
    {
      id: '7',
      organization: 'شركة الطاقة المتجددة',
      organizationEn: 'Renewable Energy Company',
      industry: 'الطاقة المتجددة',
      industryEn: 'Renewable Energy',
      contactPerson: {
        name: 'مريم الشهري',
        nameEn: 'Mariam Al-Shehri',
        position: 'مدير العمليات',
        positionEn: 'Operations Manager',
        email: 'mariam.shehri@rec.sa',
        phone: '+966507890123',
        avatar: 'MS'
      },
      address: {
        city: 'الخبر',
        cityEn: 'Khobar',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2018-01-30',
      clientSince: '2024-06-01',
      status: 'prospect',
      projects: {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0
      },
      totalValue: 0,
      paidValue: 0,
      satisfaction: 0,
      lastActivity: '2024-10-15',
      tags: ['طاقة متجددة', 'بيئة', 'استدامة'],
      tagsEn: ['Renewable Energy', 'Environment', 'Sustainability']
    },
    {
      id: '8',
      organization: 'مستشفى الملك فهد التخصصي',
      organizationEn: 'King Fahd Specialist Hospital',
      industry: 'الرعاية الصحية',
      industryEn: 'Healthcare',
      contactPerson: {
        name: 'د. خالد الحربي',
        nameEn: 'Dr. Khalid Al-Harbi',
        position: 'مدير الجودة والتطوير',
        positionEn: 'Quality and Development Director',
        email: 'k.harbi@kfsh.sa',
        phone: '+966508901234',
        avatar: 'KH'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1985-07-12',
      clientSince: '2024-07-10',
      status: 'inactive',
      projects: {
        total: 1,
        active: 0,
        completed: 0,
        onHold: 0
      },
      totalValue: 280000,
      paidValue: 0,
      satisfaction: 0,
      lastActivity: '2024-09-15',
      tags: ['صحة', 'مستشفى', 'جودة'],
      tagsEn: ['Healthcare', 'Hospital', 'Quality']
    }
  ];

  // تصفية العملاء حسب دور المستخدم
  const getFilteredClients = () => {
    let clients = allClients;

    // تصفية حسب دور المستخدم
    if (userProfile?.role === 'sub_consultant') {
      clients = clients.slice(0, 4); // العملاء المخصصين فقط
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      clients = clients.slice(0, 1); // عميل واحد فقط (مؤسستهم)
    }

    // تصفية حسب البحث
    if (searchTerm) {
      clients = clients.filter(client => 
        (dir === 'rtl' ? client.organization : client.organizationEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir === 'rtl' ? client.industry : client.industryEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      clients = clients.filter(client => client.status === statusFilter);
    }

    return clients;
  };

  const filteredClients = getFilteredClients();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: dir === 'rtl' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      inactive: { label: dir === 'rtl' ? 'غير نشط' : 'Inactive', color: 'bg-gray-100 text-gray-800', icon: Clock },
      prospect: { label: dir === 'rtl' ? 'عميل محتمل' : 'Prospect', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
  };

  // إحصائيات العملاء
  const stats = {
    total: filteredClients.length,
    active: filteredClients.filter(c => c.status === 'active').length,
    prospects: filteredClients.filter(c => c.status === 'prospect').length,
    inactive: filteredClients.filter(c => c.status === 'inactive').length,
    totalValue: filteredClients.reduce((sum, c) => sum + c.totalValue, 0),
    totalPaid: filteredClients.reduce((sum, c) => sum + c.paidValue, 0),
    avgSatisfaction: Math.round(filteredClients.filter(c => c.satisfaction > 0).reduce((sum, c) => sum + c.satisfaction, 0) / filteredClients.filter(c => c.satisfaction > 0).length) || 0,
    totalProjects: filteredClients.reduce((sum, c) => sum + c.projects.total, 0)
  };

  const handleCreateClient = (clientData: any) => {
    console.log('Creating new client:', clientData);
    alert(`${dir === 'rtl' ? 'تم إضافة العميل بنجاح' : 'Client added successfully'}: ${clientData.organization}`);
    setShowCreateClientModal(false);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleSaveClient = (updatedClient: Client) => {
    // Update the client in the list
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setShowEditModal(false);
    setSelectedClient(null);
  };

  const handleClientMenu = (client: Client) => {
    const options = [
      dir === 'rtl' ? 'عرض المشاريع' : 'View Projects',
      dir === 'rtl' ? 'عرض الفواتير' : 'View Invoices',
      dir === 'rtl' ? 'عرض التقارير' : 'View Reports',
      dir === 'rtl' ? 'إرسال رسالة' : 'Send Message',
      dir === 'rtl' ? 'تصدير بيانات' : 'Export Data'
    ];
    
    const selectedOption = prompt(`${dir === 'rtl' ? 'اختر عملية لـ' : 'Select action for'} ${dir === 'rtl' ? client.organization : client.organizationEn}:\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
    
    if (selectedOption) {
      const optionIndex = parseInt(selectedOption) - 1;
      if (optionIndex >= 0 && optionIndex < options.length) {
        alert(`${dir === 'rtl' ? 'تم اختيار:' : 'Selected:'} ${options[optionIndex]}`);
      }
    }
  };

  const handleViewProjects = (client: Client) => {
    setSelectedClient(client);
    setShowProjectsModal(true);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('clients.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('clients.description')}</p>
        </div>
        {hasPermission('clients.create') && (
          <Button onClick={() => setShowCreateClientModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('clients.newClient')}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي العملاء' : 'Total Clients'}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'عملاء نشطون' : 'Active Clients'}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalProjects}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'متوسط الرضا' : 'Avg Satisfaction'}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgSatisfaction}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{dir === 'rtl' ? 'البحث والتصفية' : 'Search & Filter'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={dir === 'rtl' ? 'ابحث عن عميل...' : 'Search for client...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{dir === 'rtl' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</option>
                <option value="prospect">{dir === 'rtl' ? 'عميل محتمل' : 'Prospect'}</option>
                <option value="inactive">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {client.contactPerson.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {dir === 'rtl' ? client.organization : client.organizationEn}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {dir === 'rtl' ? client.industry : client.industryEn}
                    </p>
                  </div>
                </div>
                {getStatusBadge(client.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Person */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{dir === 'rtl' ? 'مسؤول التواصل' : 'Communication Manager'}</h4>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => window.open(`mailto:${client.contactPerson.email}`, '_blank')}
                        >
                          <Mail className="w-4 h-4 text-[#1B4FFF] hover:text-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dir === 'rtl' ? 'إرسال بريد إلكتروني' : 'Send email'}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => window.open(`tel:${client.contactPerson.phone}`, '_blank')}
                        >
                          <Phone className="w-4 h-4 text-[#1B4FFF] hover:text-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dir === 'rtl' ? 'إجراء مكالمة' : 'Make a call'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  {dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dir === 'rtl' ? client.contactPerson.position : client.contactPerson.positionEn}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <button
                    onClick={() => window.open(`mailto:${client.contactPerson.email}`, '_blank')}
                    className="text-[#1B4FFF] hover:underline"
                  >
                    {client.contactPerson.email}
                  </button>
                  <button
                    onClick={() => window.open(`tel:${client.contactPerson.phone}`, '_blank')}
                    className="text-[#1B4FFF] hover:underline"
                  >
                    {client.contactPerson.phone}
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {dir === 'rtl' ? client.address.city : client.address.cityEn}, {dir === 'rtl' ? client.address.country : client.address.countryEn}
                </span>
              </div>

              {/* Projects Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{client.projects.total}</p>
                  <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{client.projects.active}</p>
                  <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'مشاريع نشطة' : 'Active Projects'}</p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {dir === 'rtl' ? 'القيمة الإجمالية' : 'Total Value'}
                  </p>
                  <p className="text-lg font-bold text-green-800">
                    {formatCurrency(client.totalValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {dir === 'rtl' ? 'مدفوع:' : 'Paid:'} {formatCurrency(client.paidValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {client.totalValue > 0 ? Math.round((client.paidValue / client.totalValue) * 100) : 0}% {dir === 'rtl' ? 'مكتمل' : 'completed'}
                  </p>
                </div>
              </div>

              {/* Satisfaction Score */}
              {client.satisfaction > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {dir === 'rtl' ? 'مستوى الرضا:' : 'Satisfaction:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${client.satisfaction}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{client.satisfaction}%</span>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {(dir === 'rtl' ? client.tags : client.tagsEn).slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Timeline Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {dir === 'rtl' ? 'عميل منذ:' : 'Client since:'} {formatDate(client.clientSince)}
                  </span>
                </div>
                <span>
                  {dir === 'rtl' ? 'آخر نشاط:' : 'Last activity:'} {formatDate(client.lastActivity)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleViewClient(client)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{dir === 'rtl' ? 'عرض تفاصيل العميل' : 'View client details'}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <ClientActionsMenu
                    client={client}
                    onViewDetails={handleViewClient}
                    onEditClient={handleEditClient}
                    onViewProjects={handleViewProjects}
                  />
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleViewProjects(client)}>
                      {dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dir === 'rtl' ? 'عرض جميع مشاريع هذا العميل' : 'View all projects for this client'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || statusFilter !== 'all' ? 
                (dir === 'rtl' ? 'لا توجد عملاء تطابق البحث' : 'No clients match your search') :
                (dir === 'rtl' ? 'لا توجد عملاء' : 'No clients found')
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' ?
                (dir === 'rtl' ? 'جرب معايير بحث مختلفة' : 'Try different search criteria') :
                (dir === 'rtl' ? 'ابدأ بإضافة عميلك الأول' : 'Start by adding your first client')
              }
            </p>
            {!searchTerm && statusFilter === 'all' && hasPermission('clients.create') && (
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                {t('clients.newClient')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {dir === 'rtl' ? 'ملخص مالي' : 'Financial Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'إجمالي قيمة العقود:' : 'Total Contract Value:'}
              </span>
              <span className="font-bold">{formatCurrency(stats.totalValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'المبلغ المحصل:' : 'Amount Collected:'}
              </span>
              <span className="font-bold text-green-600">{formatCurrency(stats.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'المبلغ المتبقي:' : 'Remaining Amount:'}
              </span>
              <span className="font-bold text-orange-600">{formatCurrency(stats.totalValue - stats.totalPaid)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.totalValue > 0 ? (stats.totalPaid / stats.totalValue) * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {dir === 'rtl' ? 'توزيع العملاء' : 'Client Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">{dir === 'rtl' ? 'نشط' : 'Active'}</span>
              </div>
              <span className="font-bold">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">{dir === 'rtl' ? 'عميل محتمل' : 'Prospect'}</span>
              </div>
              <span className="font-bold">{stats.prospects}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</span>
              </div>
              <span className="font-bold">{stats.inactive}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onSubmit={handleCreateClient}
      />
      
      {/* Client Details Modal */}
      <ClientDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onEdit={handleEditClient}
      />
      
      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSave={handleSaveClient}
      />
      
      {/* Client Projects Modal */}
      <ClientProjectsModal
        isOpen={showProjectsModal}
        onClose={() => {
          setShowProjectsModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />
      </div>
    </TooltipProvider>
  );
}