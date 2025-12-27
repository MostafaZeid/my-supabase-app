import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Star, 
  DollarSign,
  Upload,
  Camera,
  Edit3,
  Globe,
  Award,
  Clock,
  Target
} from 'lucide-react';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onEdit?: (client: any) => void;
}

export function ClientDetailsModal({ isOpen, onClose, client, onEdit }: ClientDetailsModalProps) {
  const { dir } = useLanguage();
  const [logoUrl, setLogoUrl] = useState(client?.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!client) return null;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoUrl(result);
        // هنا يمكن إضافة منطق رفع الصورة إلى الخادم
        console.log('تم رفع الشعار:', file.name);
      };
      reader.readAsDataURL(file);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50" dir={dir}>
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#0A1E39] to-[#1B4FFF] bg-clip-text text-transparent">
            {dir === 'rtl' ? 'تفاصيل العميل' : 'Client Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* Header Section with Logo */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Logo Section */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#1B4FFF]/10 to-[#0A1E39]/10 border-4 border-white shadow-xl overflow-hidden">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Client Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-[#1B4FFF]/50" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-[#1B4FFF] hover:bg-[#0A1E39] shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* Organization Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {dir === 'rtl' ? client.organization : client.organizationEn}
                      </h2>
                      <p className="text-lg text-muted-foreground mb-3">
                        {dir === 'rtl' ? client.industry : client.industryEn}
                      </p>
                      <Badge className={`${getStatusColor(client.status)} border text-sm px-3 py-1`}>
                        {getStatusLabel(client.status)}
                      </Badge>
                    </div>
                    
                    {onEdit && (
                      <Button 
                        onClick={() => onEdit(client)}
                        className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] text-white hover:shadow-lg"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        {dir === 'rtl' ? 'تحرير' : 'Edit'}
                      </Button>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{client.projects?.total || 0}</p>
                      <p className="text-xs text-blue-600">{dir === 'rtl' ? 'المشاريع' : 'Projects'}</p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(client.revenue || 0)}</p>
                      <p className="text-xs text-green-600">{dir === 'rtl' ? 'الإيرادات' : 'Revenue'}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{client.satisfaction || 0}%</p>
                      <p className="text-xs text-orange-600">{dir === 'rtl' ? 'الرضا' : 'Satisfaction'}</p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{client.projects?.active || 0}</p>
                      <p className="text-xs text-purple-600">{dir === 'rtl' ? 'نشط' : 'Active'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10">
                <CardTitle className="flex items-center text-foreground">
                  <Users className="w-5 h-5 mr-2" />
                  {dir === 'rtl' ? 'معلومات مسؤول التواصل' : 'Communication Manager Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                    <AvatarImage src={client.contactPerson?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-lg font-bold">
                      {(dir === 'rtl' ? client.contactPerson?.name : client.contactPerson?.nameEn)?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {dir === 'rtl' ? client.contactPerson?.name : client.contactPerson?.nameEn}
                    </h3>
                    <p className="text-muted-foreground">
                      {dir === 'rtl' ? client.contactPerson?.position : client.contactPerson?.positionEn}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</p>
                      <a 
                        href={`mailto:${client.contactPerson?.email}`} 
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {client.contactPerson?.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}</p>
                      <a 
                        href={`tel:${client.contactPerson?.phone}`} 
                        className="text-green-600 hover:underline font-medium"
                      >
                        {client.contactPerson?.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Company Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
                <CardTitle className="flex items-center text-foreground">
                  <Building2 className="w-5 h-5 mr-2" />
                  {dir === 'rtl' ? 'معلومات المؤسسة' : 'Organization Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'الموقع' : 'Location'}</p>
                      <p className="font-medium text-foreground">
                        {dir === 'rtl' 
                          ? `${client.address?.city}, ${client.address?.country}` 
                          : `${client.address?.cityEn}, ${client.address?.countryEn}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تاريخ التأسيس' : 'Established Date'}</p>
                      <p className="font-medium text-foreground">
                        {client.establishedDate ? formatDate(client.establishedDate) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'آخر نشاط' : 'Last Activity'}</p>
                      <p className="font-medium text-foreground">
                        {client.lastActivity ? formatDate(client.lastActivity) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Statistics */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10">
              <CardTitle className="flex items-center text-foreground">
                <BarChart3 className="w-5 h-5 mr-2" />
                {dir === 'rtl' ? 'إحصائيات المشاريع التفصيلية' : 'Detailed Project Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-1">{client.projects?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-1">{client.projects?.active || 0}</p>
                  <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المشاريع النشطة' : 'Active Projects'}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 mb-1">{client.projects?.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المشاريع المكتملة' : 'Completed Projects'}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-600 mb-1">{client.projects?.onHold || 0}</p>
                  <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المشاريع المعلقة' : 'On Hold Projects'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {(client.tags || client.tagsEn) && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Globe className="w-5 h-5 mr-2" />
                  {dir === 'rtl' ? 'التصنيفات' : 'Tags'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {(dir === 'rtl' ? client.tags : client.tagsEn)?.map((tag: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-[#1B4FFF]/10 hover:to-[#0A1E39]/10 hover:text-foreground transition-all duration-200 px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <Button variant="outline" onClick={onClose} className="px-6">
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          {onEdit && (
            <Button 
              onClick={() => onEdit(client)} 
              className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] text-white hover:shadow-lg px-6"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'تحرير البيانات' : 'Edit Data'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}