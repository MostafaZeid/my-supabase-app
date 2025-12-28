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
  MoreHorizontal,
  Filter,
  Download,
  Star,
  Calendar,
  DollarSign
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
import { ClientDetailsModal } from './ClientDetailsModalSimple';
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
  status: 'active' | 'inactive' | 'pending';
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  revenue: number;
  satisfaction: number;
  lastActivity: string;
  tags: string[];
  tagsEn: string[];
}

export function ClientsPageDesigned() {
  const { userProfile } = useAuth();
  const { dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);

  // Sample clients data
  const allClients: Client[] = [
    {
      id: '1',
      organization: 'مستشفى الملك فهد التخصصي',
      organizationEn: 'King Fahd Specialist Hospital',
      industry: 'الرعاية الصحية',
      industryEn: 'Healthcare',
      contactPerson: {
        name: 'د. أحمد محمد العلي',
        nameEn: 'Dr. Ahmed Mohammed Al-Ali',
        position: 'مدير عام',
        positionEn: 'General Manager',
        email: 'ahmed.ali@kfsh.med.sa',
        phone: '+966501234567',
        avatar: '/images/avatar1.jpg'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1985-03-15',
      status: 'active',
      projects: { total: 12, active: 4, completed: 7, onHold: 1 },
      revenue: 2500000,
      satisfaction: 95,
      lastActivity: '2024-12-10',
      tags: ['صحة', 'مستشفى', 'تخصصي'],
      tagsEn: ['Healthcare', 'Hospital', 'Specialist']
    },
    {
      id: '2',
      organization: 'شركة أرامكو السعودية',
      organizationEn: 'Saudi Aramco',
      industry: 'النفط والغاز',
      industryEn: 'Oil & Gas',
      contactPerson: {
        name: 'م. فاطمة سعد الزهراني',
        nameEn: 'Eng. Fatima Saad Al-Zahrani',
        position: 'مديرة المشاريع',
        positionEn: 'Project Manager',
        email: 'fatima.zahrani@aramco.com',
        phone: '+966502345678',
        avatar: '/images/avatar2.jpg'
      },
      address: {
        city: 'الظهران',
        cityEn: 'Dhahran',
        country: 'السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1933-05-29',
      status: 'active',
      projects: { total: 25, active: 8, completed: 15, onHold: 2 },
      revenue: 5800000,
      satisfaction: 98,
      lastActivity: '2024-12-12',
      tags: ['طاقة', 'نفط', 'صناعة'],
      tagsEn: ['Energy', 'Oil', 'Industry']
    },
    {
      id: '3',
      organization: 'جامعة الملك سعود',
      organizationEn: 'King Saud University',
      industry: 'التعليم',
      industryEn: 'Education',
      contactPerson: {
        name: 'د. عبدالله محمد القحطاني',
        nameEn: 'Dr. Abdullah Mohammed Al-Qahtani',
        position: 'عميد كلية الإدارة',
        positionEn: 'Dean of Management College',
        email: 'abdullah.qahtani@ksu.edu.sa',
        phone: '+966503456789',
        avatar: '/images/avatar3.jpg'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1957-11-14',
      status: 'active',
      projects: { total: 18, active: 6, completed: 10, onHold: 2 },
      revenue: 1800000,
      satisfaction: 92,
      lastActivity: '2024-12-11',
      tags: ['تعليم', 'جامعة', 'أكاديمي'],
      tagsEn: ['Education', 'University', 'Academic']
    },
    {
      id: '4',
      organization: 'بنك الراجحي',
      organizationEn: 'Al Rajhi Bank',
      industry: 'الخدمات المصرفية',
      industryEn: 'Banking',
      contactPerson: {
        name: 'أ. سارة أحمد الشمري',
        nameEn: 'Ms. Sarah Ahmed Al-Shamri',
        position: 'مديرة العمليات',
        positionEn: 'Operations Manager',
        email: 'sarah.shamri@alrajhibank.com.sa',
        phone: '+966504567890',
        avatar: '/images/avatar4.jpg'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1957-01-01',
      status: 'active',
      projects: { total: 15, active: 5, completed: 9, onHold: 1 },
      revenue: 3200000,
      satisfaction: 96,
      lastActivity: '2024-12-13',
      tags: ['مصرفية', 'مالية', 'استثمار'],
      tagsEn: ['Banking', 'Finance', 'Investment']
    }
  ];

  // Filter clients based on user role and search
  const getFilteredClients = () => {
    let clients = allClients;

    // Filter by user role
    if (userProfile?.role === 'sub_consultant') {
      clients = clients.slice(0, 3);
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      clients = clients.slice(0, 1);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      clients = clients.filter(client => client.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      clients = clients.filter(client => 
        client.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.organizationEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industryEn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return clients;
  };

  const filteredClients = getFilteredClients();

  // Calculate statistics
  const totalClients = filteredClients.length;
  const activeClients = filteredClients.filter(c => c.status === 'active').length;
  const totalRevenue = filteredClients.reduce((sum, client) => sum + client.revenue, 0);
  const avgSatisfaction = Math.round(filteredClients.reduce((sum, client) => sum + client.satisfaction, 0) / filteredClients.length);

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
      default:
        break;
    }
  };

  const handleCreateClient = (clientData: any) => {
    console.log('إنشاء عميل جديد:', clientData);
    setShowCreateClientModal(false);
  };

  const handleSaveClient = (clientData: any) => {
    console.log('حفظ بيانات العميل:', clientData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      inactive: dir === 'rtl' ? 'غير نشط' : 'Inactive',
      pending: dir === 'rtl' ? 'معلق' : 'Pending'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir={dir}>
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0A1E39] to-[#1B4FFF] bg-clip-text text-transparent">
                  {dir === 'rtl' ? 'إدارة العملاء' : 'Client Management'}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  {dir === 'rtl' ? 'إدارة شاملة لجميع العملاء والمشاريع مع أدوات متقدمة للتتبع والتحليل' : 'Comprehensive management of all clients and projects with advanced tracking and analytics tools'}
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateClientModal(true)}
                className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-6 py-3"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        {dir === 'rtl' ? 'إجمالي العملاء' : 'Total Clients'}
                      </p>
                      <p className="text-3xl font-bold">{totalClients}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Users className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        {dir === 'rtl' ? 'العملاء النشطون' : 'Active Clients'}
                      </p>
                      <p className="text-3xl font-bold">{activeClients}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        {dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                      </p>
                      <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <DollarSign className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        {dir === 'rtl' ? 'متوسط الرضا' : 'Avg Satisfaction'}
                      </p>
                      <p className="text-3xl font-bold">{avgSatisfaction}%</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Star className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter Bar */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder={dir === 'rtl' ? 'البحث عن العملاء...' : 'Search clients...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-[#1B4FFF] rounded-xl bg-white"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-2 border-gray-200 hover:border-[#1B4FFF] px-4 py-3 rounded-xl">
                          <Filter className="w-4 h-4 mr-2" />
                          {dir === 'rtl' ? 'تصفية' : 'Filter'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>{dir === 'rtl' ? 'تصفية حسب الحالة' : 'Filter by Status'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                          {dir === 'rtl' ? 'جميع العملاء' : 'All Clients'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                          {dir === 'rtl' ? 'العملاء النشطون' : 'Active Clients'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                          {dir === 'rtl' ? 'العملاء غير النشطين' : 'Inactive Clients'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                          {dir === 'rtl' ? 'العملاء المعلقون' : 'Pending Clients'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" className="border-2 border-gray-200 hover:border-[#1B4FFF] px-4 py-3 rounded-xl">
                      <Download className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'تصدير' : 'Export'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {(filteredClients || []).map((client) => (
              <Card key={client.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#1B4FFF]/10 to-[#0A1E39]/10 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] text-white text-lg font-bold">
                          {((dir === 'rtl' ? client.organization : client.organizationEn) || '').charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-foreground mb-1">
                          {dir === 'rtl' ? client.organization : client.organizationEn}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                          {dir === 'rtl' ? client.industry : client.industryEn}
                        </p>
                        <Badge className={`mt-2 ${getStatusColor(client.status)} border`}>
                          {getStatusLabel(client.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{dir === 'rtl' ? 'الإجراءات' : 'Actions'}</DropdownMenuLabel>
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
                          <span>{dir === 'rtl' ? 'اتصال هاتفي' : 'Phone Call'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('schedule', client)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'جدولة اجتماع' : 'Schedule Meeting'}</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Management Section */}
                        <DropdownMenuItem onClick={() => handleAction('edit', client)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{dir === 'rtl' ? 'تحرير البيانات' : 'Edit Data'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Contact Information */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'مسؤول التواصل' : 'Communication Manager'}
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        {dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dir === 'rtl' ? client.contactPerson.position : client.contactPerson.positionEn}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction('email', client)}
                              className="p-2 h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{dir === 'rtl' ? 'إرسال بريد إلكتروني' : 'Send Email'}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction('call', client)}
                              className="p-2 h-8 w-8 hover:bg-green-50 hover:text-green-600"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{dir === 'rtl' ? 'اتصال هاتفي' : 'Phone Call'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{dir === 'rtl' ? `${client.address.city}, ${client.address.country}` : `${client.address.cityEn}, ${client.address.countryEn}`}</span>
                    </div>
                  </div>

                  {/* Project Statistics */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'إحصائيات المشاريع' : 'Project Statistics'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{client.projects.total}</p>
                        <p className="text-xs text-blue-600">{dir === 'rtl' ? 'إجمالي' : 'Total'}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">{client.projects.active}</p>
                        <p className="text-xs text-green-600">{dir === 'rtl' ? 'نشط' : 'Active'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue and Satisfaction */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{formatCurrency(client.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'الإيرادات' : 'Revenue'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{client.satisfaction}%</p>
                      <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'الرضا' : 'Satisfaction'}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {(dir === 'rtl' ? client.tags : client.tagsEn).slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {dir === 'rtl' ? 'لا توجد عملاء' : 'No Clients Found'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {dir === 'rtl' ? 'لم يتم العثور على عملاء يطابقون معايير البحث' : 'No clients match your search criteria'}
                </p>
                <Button 
                  onClick={() => setShowCreateClientModal(true)}
                  className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modals */}
        <ClientDetailsModal
          isOpen={showDetailsModal}
          onClose={handleCloseModal}
          client={selectedClient}
          onEdit={handleAction}
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
        
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={handleCloseModal}
          client={selectedClient}
        />
        
        <ClientReportsModal
          isOpen={showReportsModal}
          onClose={handleCloseModal}
          client={selectedClient}
        />
        
        <ScheduleMeetingModal
          isOpen={showScheduleModal}
          onClose={handleCloseModal}
          client={selectedClient}
        />
        
        <CreateClientModal
          isOpen={showCreateClientModal}
          onClose={() => setShowCreateClientModal(false)}
          onSave={handleCreateClient}
        />
      </div>
    </TooltipProvider>
  );
}