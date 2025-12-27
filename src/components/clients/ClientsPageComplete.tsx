import { useState } from 'react';
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
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Import the modals
import { InvoiceModal } from './InvoiceModalSimple';
import { ClientReportsModal } from './ClientReportsModalSimple';
import { ScheduleMeetingModal } from './ScheduleMeetingModalSimple';
import { ClientDetailsModal } from './ClientDetailsModalInteractive';
import { EditClientModal } from './EditClientModalSimple';
import { ClientProjectsModal } from './ClientProjectsModalSimple';
import { CreateClientModal } from './CreateClientModal';

interface Client {
  id: string;
  organization: string;
  organizationEn: string;
  industry: string;
  industryEn: string;
  contactPerson: {
    name: string;
    nameEn: string;
    position: string;
    positionEn: string;
    email: string;
    phone: string;
    avatar: string;
  };
  address: {
    city: string;
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
  
  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
      establishedDate: '1995-03-15',
      clientSince: '2024-01-15',
      status: 'active',
      projects: {
        total: 3,
        active: 2,
        completed: 1,
        onHold: 0
      },
      totalValue: 1250000,
      paidValue: 750000,
      revenue: 1250000,
      satisfaction: 95,
      logo: './images/mansour-logo_20251213_171634.png',
      lastActivity: '2024-10-30',
      tags: ['استثمار', 'قابضة', 'كبير'],
      tagsEn: ['Investment', 'Holding', 'Large']
    },
    {
      id: '2',
      organization: 'مجموعة الاستثمار الخليجي',
      organizationEn: 'Gulf Investment Group',
      industry: 'الاستثمار والمالية',
      industryEn: 'Investment & Finance',
      contactPerson: {
        name: 'فاطمة الزهراني',
        nameEn: 'Fatima Al-Zahrani',
        position: 'مديرة الاستثمار',
        positionEn: 'Investment Director',
        email: 'f.zahrani@gig.sa',
        phone: '+966502345678',
        avatar: 'FZ'
      },
      address: {
        city: 'جدة',
        cityEn: 'Jeddah',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2010-08-22',
      clientSince: '2024-05-20',
      status: 'prospect',
      projects: {
        total: 2,
        active: 1,
        completed: 0,
        onHold: 1
      },
      totalValue: 850000,
      paidValue: 425000,
      revenue: 850000,
      satisfaction: 88,
      logo: './images/gig-logo_20251213_171646.png',
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
        total: 4,
        active: 2,
        completed: 2,
        onHold: 0
      },
      totalValue: 2100000,
      paidValue: 1680000,
      revenue: 2100000,
      satisfaction: 92,
      logo: './images/ncb-logo_20251213_171658.png',
      lastActivity: '2024-10-28',
      tags: ['بنك', 'حوكمة', 'امتثال'],
      tagsEn: ['Bank', 'Governance', 'Compliance']
    },
    {
      id: '4',
      organization: 'شركة الاتصالات الرقمية',
      organizationEn: 'Digital Communications Company',
      industry: 'التكنولوجيا والاتصالات',
      industryEn: 'Technology & Communications',
      contactPerson: {
        name: 'نورا العتيبي',
        nameEn: 'Nora Al-Otaibi',
        position: 'مديرة التطوير التنظيمي',
        positionEn: 'Organizational Development Manager',
        email: 'n.otaibi@dcc.sa',
        phone: '+966504567890',
        avatar: 'NO'
      },
      address: {
        city: 'الدمام',
        cityEn: 'Dammam',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2005-11-10',
      clientSince: '2024-06-05',
      status: 'active',
      projects: {
        total: 2,
        active: 1,
        completed: 1,
        onHold: 0
      },
      totalValue: 680000,
      paidValue: 340000,
      revenue: 680000,
      satisfaction: 90,
      logo: '/images/dcc-logo.png',
      lastActivity: '2024-10-27',
      tags: ['تكنولوجيا', 'اتصالات', 'رقمي'],
      tagsEn: ['Technology', 'Communications', 'Digital']
    },
    {
      id: '5',
      organization: 'مستشفى الملك فيصل التخصصي',
      organizationEn: 'King Faisal Specialist Hospital',
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
        onHold: 1
      },
      totalValue: 280000,
      paidValue: 0,
      revenue: 280000,
      satisfaction: 0,
      logo: '/images/kfsh-logo.png',
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

  // إحصائيات العملاء
  const stats = {
    total: filteredClients.length,
    active: filteredClients.filter(c => c.status === 'active').length,
    prospects: filteredClients.filter(c => c.status === 'prospect').length,
    inactive: filteredClients.filter(c => c.status === 'inactive').length,
    totalProjects: filteredClients.reduce((sum, c) => sum + c.projects.total, 0),
    avgSatisfaction: Math.round(
      filteredClients.filter(c => c.satisfaction > 0).reduce((sum, c) => sum + c.satisfaction, 0) / 
      filteredClients.filter(c => c.satisfaction > 0).length
    ) || 0
  };

  // دوال التعامل مع العملاء والمكونات
  const handleAction = (action: string, client: Client) => {
    setSelectedClient(client);
    
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      case 'projects':
        setShowProjectsModal(true);
        break;
      case 'reports':
        setShowReportsModal(true);
        break;
      case 'invoices':
        setShowInvoiceModal(true);
        break;
      case 'email':
        window.open(`mailto:${client.contactPerson.email}`, '_blank');
        break;
      case 'call':
        window.open(`tel:${client.contactPerson.phone}`, '_blank');
        break;
      case 'schedule':
        setShowScheduleModal(true);
        break;
      case 'export':
        alert(`${dir === 'rtl' ? 'تصدير بيانات العميل:' : 'Export client data:'} ${dir === 'rtl' ? client.organization : client.organizationEn}`);
        break;
      case 'archive':
        if (confirm(`${dir === 'rtl' ? 'هل أنت متأكد من أرشفة العميل:' : 'Are you sure you want to archive client:'} ${dir === 'rtl' ? client.organization : client.organizationEn}?`)) {
          alert(`${dir === 'rtl' ? 'تم أرشفة العميل' : 'Client archived'}`);
        }
        break;
      case 'delete':
        if (confirm(`${dir === 'rtl' ? 'هل أنت متأكد من حذف العميل:' : 'Are you sure you want to delete client:'} ${dir === 'rtl' ? client.organization : client.organizationEn}?`)) {
          alert(`${dir === 'rtl' ? 'تم حذف العميل' : 'Client deleted'}`);
        }
        break;
      default:
        break;
    }
  };

  // دوال إضافية للتعامل مع المكونات الجديدة
  const handleCreateClient = (clientData: any) => {
    console.log('إنشاء عميل جديد:', clientData);
    // يمكن إضافة العميل الجديد إلى القائمة هنا
    setShowCreateClientModal(false);
  };

  const handleSaveClient = (clientData: any) => {
    console.log('حفظ بيانات العميل:', clientData);
    // يمكن تحديث بيانات العميل هنا
    setShowEditModal(false);
    setSelectedClient(null);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowProjectsModal(false);
    setShowInvoiceModal(false);
    setShowReportsModal(false);
    setShowScheduleModal(false);
    setSelectedClient(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6" dir={dir}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {dir === 'rtl' ? 'إدارة العملاء' : 'Client Management'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {dir === 'rtl' ? 'إدارة وتتبع جميع العملاء والمشاريع مع المكونات الشاملة' : 'Manage and track all clients and projects with comprehensive components'}
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateClientModal(true)}
            className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي العملاء' : 'Total Clients'}</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">{dir === 'rtl' ? 'عملاء نشطون' : 'Active Clients'}</p>
                  <p className="text-2xl font-bold text-green-800">{stats.active}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">{dir === 'rtl' ? 'عملاء محتملون' : 'Prospects'}</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.prospects}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">{dir === 'rtl' ? 'غير نشطين' : 'Inactive'}</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.inactive}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                  <p className="text-2xl font-bold text-orange-800">{stats.totalProjects}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-700">{dir === 'rtl' ? 'متوسط الرضا' : 'Avg Satisfaction'}</p>
                  <p className="text-2xl font-bold text-indigo-800">{stats.avgSatisfaction}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              {dir === 'rtl' ? 'البحث والتصفية' : 'Search & Filter'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                  <Input
                    placeholder={dir === 'rtl' ? 'ابحث عن عميل...' : 'Search for client...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} border-2 focus:border-[#1B4FFF] transition-colors`}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-[#1B4FFF] transition-colors"
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
            <Card key={client.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-[#1B4FFF]/10 to-[#0A1E39]/10 rounded-t-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-[#1B4FFF]/20">
                      <AvatarFallback className="bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] text-white font-semibold">
                        {client.contactPerson.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {dir === 'rtl' ? client.organization : client.organizationEn}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {dir === 'rtl' ? client.industry : client.industryEn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(client.status)}
                    
                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          {dir === 'rtl' ? 'عمليات العميل' : 'Client Actions'}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {/* View Section */}
                        <DropdownMenuItem onClick={() => handleAction('view', client)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('projects', client)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('reports', client)}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'التقارير' : 'Reports'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('invoices', client)} data-action="invoice">
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'الفواتير' : 'Invoices'}</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Communication Section */}
                        <DropdownMenuItem onClick={() => handleAction('email', client)}>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'إرسال بريد إلكتروني' : 'Send Email'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('call', client)}>
                          <Phone className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'إجراء مكالمة' : 'Make Call'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('schedule', client)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'جدولة اجتماع' : 'Schedule Meeting'}</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Management Section */}
                        <DropdownMenuItem onClick={() => handleAction('edit', client)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'تحرير البيانات' : 'Edit Data'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('export', client)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'تصدير البيانات' : 'Export Data'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 p-6">
                {/* Contact Person */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-foreground">{dir === 'rtl' ? 'مسؤول التواصل' : 'Communication Manager'}</h4>

                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dir === 'rtl' ? client.contactPerson.position : client.contactPerson.positionEn}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-muted-foreground">{client.contactPerson.email}</span>
                    <span className="text-muted-foreground">{client.contactPerson.phone}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-[#1B4FFF]" />
                  <span>
                    {dir === 'rtl' ? client.address.city : client.address.cityEn}, {dir === 'rtl' ? client.address.country : client.address.countryEn}
                  </span>
                </div>

                {/* Projects Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-700">{client.projects.total}</p>
                    <p className="text-xs text-blue-600">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-700">{client.projects.active}</p>
                    <p className="text-xs text-green-600">{dir === 'rtl' ? 'مشاريع نشطة' : 'Active Projects'}</p>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {dir === 'rtl' ? 'القيمة الإجمالية' : 'Total Value'}
                    </p>
                    <p className="text-lg font-bold text-green-900">
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
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <span className="text-sm text-orange-800 font-medium">
                      {dir === 'rtl' ? 'مستوى الرضا:' : 'Satisfaction:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${client.satisfaction}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-orange-800">{client.satisfaction}%</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {(dir === 'rtl' ? client.tags : client.tagsEn).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-gradient-to-r from-[#1B4FFF]/10 to-[#0A1E39]/10 text-foreground border border-[#1B4FFF]/20">
                      {tag}
                    </Badge>
                  ))}
                </div>


              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {dir === 'rtl' ? 'لا توجد عملاء' : 'No clients found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {dir === 'rtl' ? 'لم يتم العثور على عملاء يطابقون معايير البحث' : 'No clients match your search criteria'}
              </p>
              <Button className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Modals */}
        {selectedClient && (
          <>
            <InvoiceModal
              isOpen={showInvoiceModal}
              onClose={() => {
                setShowInvoiceModal(false);
                setSelectedClient(null);
              }}
              client={selectedClient}
            />
            
            <ClientReportsModal
              isOpen={showReportsModal}
              onClose={() => {
                setShowReportsModal(false);
                setSelectedClient(null);
              }}
              client={selectedClient}
            />
            
            <ScheduleMeetingModal
              isOpen={showScheduleModal}
              onClose={handleCloseModal}
              client={selectedClient}
            />
            
            <ClientDetailsModal
              isOpen={showDetailsModal}
              onClose={handleCloseModal}
              client={selectedClient}
              onEdit={(client) => {
                setSelectedClient(client);
                setShowDetailsModal(false);
                setShowEditModal(true);
              }}
            />
            
            <EditClientModal
              isOpen={showEditModal}
              onClose={handleCloseModal}
              client={selectedClient}
              onSave={handleSaveClient}
            />
            
            <ClientProjectsModal
              isOpen={showProjectsModal}
              onClose={handleCloseModal}
              client={selectedClient}
            />
          </>
        )}
        
        {/* Create Client Modal */}
        <CreateClientModal
          isOpen={showCreateClientModal}
          onClose={() => setShowCreateClientModal(false)}
          onSubmit={handleCreateClient}
        />
      </div>
    </TooltipProvider>
  );
}