import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
  status: 'active' | 'inactive' | 'prospect';
  projects: {
    total: number;
    active: number;
  };
  totalValue: number;
  paidValue: number;
  satisfaction: number;
}

export function ClientsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { language, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // بيانات العملاء المبسطة
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
      status: 'active',
      projects: {
        total: 3,
        active: 2
      },
      totalValue: 1250000,
      paidValue: 750000,
      satisfaction: 95
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
      status: 'prospect',
      projects: {
        total: 2,
        active: 1
      },
      totalValue: 850000,
      paidValue: 425000,
      satisfaction: 88
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
      status: 'active',
      projects: {
        total: 4,
        active: 2
      },
      totalValue: 2100000,
      paidValue: 1680000,
      satisfaction: 92
    }
  ];

  // تصفية العملاء
  const getFilteredClients = () => {
    let clients = allClients;

    if (searchTerm) {
      clients = clients.filter(client => 
        (dir === 'rtl' ? client.organization : client.organizationEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {dir === 'rtl' ? 'إدارة العملاء' : 'Client Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {dir === 'rtl' ? 'إدارة وتتبع جميع العملاء والمشاريع' : 'Manage and track all clients and projects'}
          </p>
        </div>
        <Button className="bg-[#1B4FFF] hover:bg-[#0A1E39] text-white">
          <Plus className="w-4 h-4 mr-2" />
          {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي العملاء' : 'Total Clients'}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
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
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'عملاء محتملون' : 'Prospects'}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.prospects}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'غير نشطين' : 'Inactive'}</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
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
                <h4 className="font-medium text-sm mb-2">{dir === 'rtl' ? 'مسؤول التواصل' : 'Communication Manager'}</h4>
                <p className="text-sm font-medium">
                  {dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dir === 'rtl' ? client.contactPerson.position : client.contactPerson.positionEn}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <button
                    onClick={() => window.open(`mailto:${client.contactPerson.email}`, '_blank')}
                    className="text-[#1B4FFF] hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    {client.contactPerson.email}
                  </button>
                  <button
                    onClick={() => window.open(`tel:${client.contactPerson.phone}`, '_blank')}
                    className="text-[#1B4FFF] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`عرض تفاصيل ${client.organization}`)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`عرض مشاريع ${client.organization}`)}
                  className="flex-1"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dir === 'rtl' ? 'لا توجد عملاء' : 'No clients found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {dir === 'rtl' ? 'لم يتم العثور على عملاء يطابقون معايير البحث' : 'No clients match your search criteria'}
            </p>
            <Button className="bg-[#1B4FFF] hover:bg-[#0A1E39] text-white">
              <Plus className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}