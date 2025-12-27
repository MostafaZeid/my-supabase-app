import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Star,
  Globe,
  FileText,
  Target
} from 'lucide-react';
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

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit?: (client: Client) => void;
}

export function ClientDetailsModal({ isOpen, onClose, client, onEdit }: ClientDetailsModalProps) {
  const { language, dir } = useLanguage();

  if (!client) return null;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      inactive: dir === 'rtl' ? 'غير نشط' : 'Inactive',
      prospect: dir === 'rtl' ? 'عميل محتمل' : 'Prospect'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-[#1B4FFF]/20">
                <AvatarFallback className="bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] text-white font-semibold text-lg">
                  {client.contactPerson.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{dir === 'rtl' ? client.organization : client.organizationEn}</div>
                <p className="text-sm font-normal text-muted-foreground">
                  {dir === 'rtl' ? 'تفاصيل العميل الشاملة' : 'Comprehensive Client Details'}
                </p>
              </div>
            </DialogTitle>
            {onEdit && (
              <Button
                onClick={() => onEdit(client)}
                variant="outline"
                className="border-[#1B4FFF] text-[#1B4FFF] hover:bg-[#1B4FFF] hover:text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'تحرير' : 'Edit'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#1B4FFF]" />
                  {dir === 'rtl' ? 'معلومات أساسية' : 'Basic Information'}
                </CardTitle>
                <Badge className={`${getStatusColor(client.status)} flex items-center gap-1`}>
                  {client.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                  {client.status === 'inactive' && <Clock className="w-3 h-3" />}
                  {client.status === 'prospect' && <TrendingUp className="w-3 h-3" />}
                  {getStatusLabel(client.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#1B4FFF]" />
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'القطاع' : 'Industry'}</p>
                      <p className="font-medium text-foreground">
                        {dir === 'rtl' ? client.industry : client.industryEn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#1B4FFF]" />
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تاريخ التأسيس' : 'Established'}</p>
                      <p className="font-medium text-foreground">{formatDate(client.establishedDate)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#1B4FFF]" />
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'عميل منذ' : 'Client Since'}</p>
                      <p className="font-medium text-foreground">{formatDate(client.clientSince)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#1B4FFF]" />
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'آخر نشاط' : 'Last Activity'}</p>
                      <p className="font-medium text-foreground">{formatDate(client.lastActivity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'معلومات الاتصال' : 'Contact Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{dir === 'rtl' ? 'مسؤول التواصل' : 'Communication Manager'}</p>
                    <p className="font-semibold text-foreground text-lg">
                      {dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}
                    </p>
                    <p className="text-muted-foreground">
                      {dir === 'rtl' ? client.contactPerson.position : client.contactPerson.positionEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#1B4FFF]" />
                    <button
                      onClick={() => window.open(`mailto:${client.contactPerson.email}`, '_blank')}
                      className="text-[#1B4FFF] hover:underline transition-colors"
                    >
                      {client.contactPerson.email}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#1B4FFF]" />
                    <button
                      onClick={() => window.open(`tel:${client.contactPerson.phone}`, '_blank')}
                      className="text-[#1B4FFF] hover:underline transition-colors"
                    >
                      {client.contactPerson.phone}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{dir === 'rtl' ? 'العنوان' : 'Address'}</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1B4FFF]" />
                      <p className="text-foreground">
                        {dir === 'rtl' ? client.address.city : client.address.cityEn}, {dir === 'rtl' ? client.address.country : client.address.countryEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Statistics */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'إحصائيات المشاريع' : 'Project Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{client.projects.total}</div>
                  <div className="text-sm text-blue-600">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{client.projects.active}</div>
                  <div className="text-sm text-green-600">{dir === 'rtl' ? 'مشاريع نشطة' : 'Active Projects'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{client.projects.completed}</div>
                  <div className="text-sm text-purple-600">{dir === 'rtl' ? 'مشاريع مكتملة' : 'Completed Projects'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{client.projects.onHold}</div>
                  <div className="text-sm text-orange-600">{dir === 'rtl' ? 'مشاريع معلقة' : 'On Hold Projects'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'المعلومات المالية' : 'Financial Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'القيمة الإجمالية' : 'Total Value'}</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-700">{formatCurrency(client.totalValue)}</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المدفوع' : 'Paid Amount'}</span>
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(client.paidValue)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المستحق' : 'Outstanding Amount'}</span>
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-700">
                      {formatCurrency(client.totalValue - client.paidValue)}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'نسبة السداد' : 'Payment Ratio'}</span>
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xl font-bold text-purple-700">
                        {client.totalValue > 0 ? Math.round((client.paidValue / client.totalValue) * 100) : 0}%
                      </div>
                      <Progress 
                        value={client.totalValue > 0 ? (client.paidValue / client.totalValue) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction Score */}
          {client.satisfaction > 0 && (
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#1B4FFF]" />
                  {dir === 'rtl' ? 'مستوى رضا العميل' : 'Client Satisfaction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 bg-white rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-indigo-700">{client.satisfaction}%</div>
                    <div>
                      <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'مستوى الرضا الإجمالي' : 'Overall Satisfaction'}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(client.satisfaction / 20)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-32">
                    <Progress value={client.satisfaction} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'العلامات والتصنيفات' : 'Tags & Categories'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(dir === 'rtl' ? client.tags : client.tagsEn).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gradient-to-r from-[#1B4FFF]/10 to-[#0A1E39]/10 text-foreground border border-[#1B4FFF]/20 px-3 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          {onEdit && (
            <Button
              onClick={() => onEdit(client)}
              className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'تحرير العميل' : 'Edit Client'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}