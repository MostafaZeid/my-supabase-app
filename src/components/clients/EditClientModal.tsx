import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Globe,
  Save,
  X,
  Plus,
  Trash2
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

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientData: any) => void;
}

export function EditClientModal({ isOpen, onClose, client, onSave }: EditClientModalProps) {
  const { language, dir } = useLanguage();
  const [formData, setFormData] = useState<any>({});
  const [newTag, setNewTag] = useState('');
  const [newTagEn, setNewTagEn] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        organization: client.organization,
        organizationEn: client.organizationEn,
        industry: client.industry,
        industryEn: client.industryEn,
        contactPerson: { ...client.contactPerson },
        address: { ...client.address },
        establishedDate: client.establishedDate,
        status: client.status,
        tags: [...client.tags],
        tagsEn: [...client.tagsEn],
        satisfaction: client.satisfaction
      });
    }
  }, [client]);

  if (!client) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && newTagEn.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
        tagsEn: [...prev.tagsEn, newTagEn.trim()]
      }));
      setNewTag('');
      setNewTagEn('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((_: any, i: number) => i !== index),
      tagsEn: prev.tagsEn.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const generateAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-[#1B4FFF]/20">
              <AvatarFallback className="bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] text-white font-semibold text-lg">
                {generateAvatar(formData.contactPerson?.name || client.contactPerson.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>{dir === 'rtl' ? 'تحرير بيانات العميل' : 'Edit Client Information'}</div>
              <p className="text-sm font-normal text-muted-foreground">
                {dir === 'rtl' ? formData.organization : formData.organizationEn}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Organization Information */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'معلومات المؤسسة' : 'Organization Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">{dir === 'rtl' ? 'اسم المؤسسة (عربي)' : 'Organization Name (Arabic)'}</Label>
                  <Input
                    id="organization"
                    value={formData.organization || ''}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizationEn">{dir === 'rtl' ? 'اسم المؤسسة (إنجليزي)' : 'Organization Name (English)'}</Label>
                  <Input
                    id="organizationEn"
                    value={formData.organizationEn || ''}
                    onChange={(e) => handleInputChange('organizationEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">{dir === 'rtl' ? 'القطاع (عربي)' : 'Industry (Arabic)'}</Label>
                  <Input
                    id="industry"
                    value={formData.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industryEn">{dir === 'rtl' ? 'القطاع (إنجليزي)' : 'Industry (English)'}</Label>
                  <Input
                    id="industryEn"
                    value={formData.industryEn || ''}
                    onChange={(e) => handleInputChange('industryEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="establishedDate">{dir === 'rtl' ? 'تاريخ التأسيس' : 'Established Date'}</Label>
                  <Input
                    id="establishedDate"
                    type="date"
                    value={formData.establishedDate || ''}
                    onChange={(e) => handleInputChange('establishedDate', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{dir === 'rtl' ? 'حالة العميل' : 'Client Status'}</Label>
                  <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="border-2 focus:border-[#1B4FFF]">
                      <SelectValue placeholder={dir === 'rtl' ? 'اختر الحالة' : 'Select Status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="inactive">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</SelectItem>
                      <SelectItem value="prospect">{dir === 'rtl' ? 'عميل محتمل' : 'Prospect'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Person Information */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'معلومات مسؤول التواصل' : 'Communication Manager Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">{dir === 'rtl' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    id="contactName"
                    value={formData.contactPerson?.name || ''}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'name', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNameEn">{dir === 'rtl' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    id="contactNameEn"
                    value={formData.contactPerson?.nameEn || ''}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'nameEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPosition">{dir === 'rtl' ? 'المنصب (عربي)' : 'Position (Arabic)'}</Label>
                  <Input
                    id="contactPosition"
                    value={formData.contactPerson?.position || ''}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'position', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPositionEn">{dir === 'rtl' ? 'المنصب (إنجليزي)' : 'Position (English)'}</Label>
                  <Input
                    id="contactPositionEn"
                    value={formData.contactPerson?.positionEn || ''}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'positionEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactPerson?.email || ''}
                      onChange={(e) => handleNestedInputChange('contactPerson', 'email', e.target.value)}
                      className="pl-10 border-2 focus:border-[#1B4FFF]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">{dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPerson?.phone || ''}
                      onChange={(e) => handleNestedInputChange('contactPerson', 'phone', e.target.value)}
                      className="pl-10 border-2 focus:border-[#1B4FFF]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'معلومات العنوان' : 'Address Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{dir === 'rtl' ? 'المدينة (عربي)' : 'City (Arabic)'}</Label>
                  <Input
                    id="city"
                    value={formData.address?.city || ''}
                    onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityEn">{dir === 'rtl' ? 'المدينة (إنجليزي)' : 'City (English)'}</Label>
                  <Input
                    id="cityEn"
                    value={formData.address?.cityEn || ''}
                    onChange={(e) => handleNestedInputChange('address', 'cityEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">{dir === 'rtl' ? 'الدولة (عربي)' : 'Country (Arabic)'}</Label>
                  <Input
                    id="country"
                    value={formData.address?.country || ''}
                    onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryEn">{dir === 'rtl' ? 'الدولة (إنجليزي)' : 'Country (English)'}</Label>
                  <Input
                    id="countryEn"
                    value={formData.address?.countryEn || ''}
                    onChange={(e) => handleNestedInputChange('address', 'countryEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction Score */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'مستوى الرضا' : 'Satisfaction Level'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="satisfaction">{dir === 'rtl' ? 'مستوى رضا العميل (%)' : 'Client Satisfaction Level (%)'}</Label>
                <Input
                  id="satisfaction"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.satisfaction || 0}
                  onChange={(e) => handleInputChange('satisfaction', parseInt(e.target.value) || 0)}
                  className="border-2 focus:border-[#1B4FFF]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags Management */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'إدارة العلامات' : 'Tags Management'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Tags */}
              <div>
                <Label className="text-sm font-medium">{dir === 'rtl' ? 'العلامات الحالية' : 'Current Tags'}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-[#1B4FFF]/10 to-[#0A1E39]/10 text-foreground border border-[#1B4FFF]/20 px-3 py-1 flex items-center gap-2"
                    >
                      <span>{dir === 'rtl' ? tag : formData.tagsEn?.[index]}</span>
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Add New Tag */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newTag">{dir === 'rtl' ? 'علامة جديدة (عربي)' : 'New Tag (Arabic)'}</Label>
                  <Input
                    id="newTag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'أدخل علامة جديدة' : 'Enter new tag'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newTagEn">{dir === 'rtl' ? 'علامة جديدة (إنجليزي)' : 'New Tag (English)'}</Label>
                  <Input
                    id="newTagEn"
                    value={newTagEn}
                    onChange={(e) => setNewTagEn(e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'Enter new tag' : 'Enter new tag'}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || !newTagEn.trim()}
                    className="w-full bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {dir === 'rtl' ? 'إضافة' : 'Add'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}