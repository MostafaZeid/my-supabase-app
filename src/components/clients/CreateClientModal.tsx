import { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: any) => void;
}

export function CreateClientModal({ isOpen, onClose, onSubmit }: CreateClientModalProps) {
  const { language, dir } = useLanguage();
  const [formData, setFormData] = useState({
    organization: '',
    organizationEn: '',
    industry: '',
    industryEn: '',
    contactPerson: {
      name: '',
      nameEn: '',
      position: '',
      positionEn: '',
      email: '',
      phone: '',
    },
    address: {
      city: '',
      cityEn: '',
      country: '',
      countryEn: '',
    },
    establishedDate: '',
    status: 'prospect',
    tags: [] as string[],
    tagsEn: [] as string[],
    satisfaction: 0,
    notes: '',
    notesEn: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newTagEn, setNewTagEn] = useState('');
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (errors[`${parent}.${field}`]) {
      setErrors((prev: any) => ({
        ...prev,
        [`${parent}.${field}`]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && newTagEn.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
        tagsEn: [...prev.tagsEn, newTagEn.trim()]
      }));
      setNewTag('');
      setNewTagEn('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
      tagsEn: prev.tagsEn.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Required fields validation
    if (!formData.organization.trim()) {
      newErrors.organization = dir === 'rtl' ? 'اسم المؤسسة مطلوب' : 'Organization name is required';
    }
    if (!formData.organizationEn.trim()) {
      newErrors.organizationEn = dir === 'rtl' ? 'اسم المؤسسة بالإنجليزية مطلوب' : 'Organization name in English is required';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = dir === 'rtl' ? 'القطاع مطلوب' : 'Industry is required';
    }
    if (!formData.industryEn.trim()) {
      newErrors.industryEn = dir === 'rtl' ? 'القطاع بالإنجليزية مطلوب' : 'Industry in English is required';
    }
    if (!formData.contactPerson.name.trim()) {
      newErrors['contactPerson.name'] = dir === 'rtl' ? 'اسم مسؤول التواصل مطلوب' : 'Communication manager name is required';
    }
    if (!formData.contactPerson.nameEn.trim()) {
      newErrors['contactPerson.nameEn'] = dir === 'rtl' ? 'اسم مسؤول التواصل بالإنجليزية مطلوب' : 'Communication manager name in English is required';
    }
    if (!formData.contactPerson.email.trim()) {
      newErrors['contactPerson.email'] = dir === 'rtl' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactPerson.email)) {
      newErrors['contactPerson.email'] = dir === 'rtl' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
    }
    if (!formData.contactPerson.phone.trim()) {
      newErrors['contactPerson.phone'] = dir === 'rtl' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const clientData = {
        ...formData,
        id: Date.now().toString(), // Generate temporary ID
        contactPerson: {
          ...formData.contactPerson,
          avatar: generateAvatar(formData.contactPerson.name)
        },
        clientSince: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        projects: {
          total: 0,
          active: 0,
          completed: 0,
          onHold: 0
        },
        totalValue: 0,
        paidValue: 0
      };
      
      onSubmit(clientData);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setFormData({
      organization: '',
      organizationEn: '',
      industry: '',
      industryEn: '',
      contactPerson: {
        name: '',
        nameEn: '',
        position: '',
        positionEn: '',
        email: '',
        phone: '',
      },
      address: {
        city: '',
        cityEn: '',
        country: '',
        countryEn: '',
      },
      establishedDate: '',
      status: 'prospect',
      tags: [],
      tagsEn: [],
      satisfaction: 0,
      notes: '',
      notesEn: ''
    });
    setNewTag('');
    setNewTagEn('');
    setErrors({});
  };

  const generateAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>{dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}</div>
              <p className="text-sm font-normal text-muted-foreground">
                {dir === 'rtl' ? 'إدخال معلومات العميل الجديد' : 'Enter new client information'}
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
                  <Label htmlFor="organization" className="text-sm font-medium">
                    {dir === 'rtl' ? 'اسم المؤسسة (عربي)' : 'Organization Name (Arabic)'} *
                  </Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    className={`border-2 focus:border-[#1B4FFF] ${errors.organization ? 'border-red-500' : ''}`}
                    placeholder={dir === 'rtl' ? 'أدخل اسم المؤسسة' : 'Enter organization name'}
                  />
                  {errors.organization && (
                    <p className="text-red-500 text-xs">{errors.organization}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizationEn" className="text-sm font-medium">
                    {dir === 'rtl' ? 'اسم المؤسسة (إنجليزي)' : 'Organization Name (English)'} *
                  </Label>
                  <Input
                    id="organizationEn"
                    value={formData.organizationEn}
                    onChange={(e) => handleInputChange('organizationEn', e.target.value)}
                    className={`border-2 focus:border-[#1B4FFF] ${errors.organizationEn ? 'border-red-500' : ''}`}
                    placeholder={dir === 'rtl' ? 'Enter organization name' : 'Enter organization name'}
                  />
                  {errors.organizationEn && (
                    <p className="text-red-500 text-xs">{errors.organizationEn}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium">
                    {dir === 'rtl' ? 'القطاع (عربي)' : 'Industry (Arabic)'} *
                  </Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className={`border-2 focus:border-[#1B4FFF] ${errors.industry ? 'border-red-500' : ''}`}
                    placeholder={dir === 'rtl' ? 'أدخل القطاع' : 'Enter industry'}
                  />
                  {errors.industry && (
                    <p className="text-red-500 text-xs">{errors.industry}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industryEn" className="text-sm font-medium">
                    {dir === 'rtl' ? 'القطاع (إنجليزي)' : 'Industry (English)'} *
                  </Label>
                  <Input
                    id="industryEn"
                    value={formData.industryEn}
                    onChange={(e) => handleInputChange('industryEn', e.target.value)}
                    className={`border-2 focus:border-[#1B4FFF] ${errors.industryEn ? 'border-red-500' : ''}`}
                    placeholder={dir === 'rtl' ? 'Enter industry' : 'Enter industry'}
                  />
                  {errors.industryEn && (
                    <p className="text-red-500 text-xs">{errors.industryEn}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="establishedDate" className="text-sm font-medium">
                    {dir === 'rtl' ? 'تاريخ التأسيس' : 'Established Date'}
                  </Label>
                  <Input
                    id="establishedDate"
                    type="date"
                    value={formData.establishedDate}
                    onChange={(e) => handleInputChange('establishedDate', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    {dir === 'rtl' ? 'حالة العميل' : 'Client Status'}
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="border-2 focus:border-[#1B4FFF]">
                      <SelectValue placeholder={dir === 'rtl' ? 'اختر الحالة' : 'Select Status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">{dir === 'rtl' ? 'عميل محتمل' : 'Prospect'}</SelectItem>
                      <SelectItem value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="inactive">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</SelectItem>
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
                  <Label htmlFor="contactName" className="text-sm font-medium">
                    {dir === 'rtl' ? 'الاسم (عربي)' : 'Name (Arabic)'} *
                  </Label>
                  <Input
                    id="contactName"
                    value={formData.contactPerson.name}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'name', e.target.value)}
                    className={`border-2 focus:border-[#1B4FFF] ${errors['contactPerson.name'] ? 'border-red-500' : ''}`}
                    placeholder={dir === 'rtl' ? 'أدخل الاسم' : 'Enter name'}
                  />
                  {errors['contactPerson.name'] && (
                    <p className="text-red-500 text-xs">{errors['contactPerson.name']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNameEn" className="text-sm font-medium">
                    {dir === 'rtl' ? 'الاسم (إنجليزي)' : 'Name (English)'} *
                  </Label>
                  <Input
                    id="contactNameEn"
                    value={formData.contactPerson.nameEn}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'nameEn', e.target.value)}
                    className={`border-2 focus:border-[#1B4FFF] ${errors['contactPerson.nameEn'] ? 'border-red-500' : ''}`}
                    placeholder={dir === 'rtl' ? 'Enter name' : 'Enter name'}
                  />
                  {errors['contactPerson.nameEn'] && (
                    <p className="text-red-500 text-xs">{errors['contactPerson.nameEn']}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPosition" className="text-sm font-medium">
                    {dir === 'rtl' ? 'المنصب (عربي)' : 'Position (Arabic)'}
                  </Label>
                  <Input
                    id="contactPosition"
                    value={formData.contactPerson.position}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'position', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'أدخل المنصب' : 'Enter position'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPositionEn" className="text-sm font-medium">
                    {dir === 'rtl' ? 'المنصب (إنجليزي)' : 'Position (English)'}
                  </Label>
                  <Input
                    id="contactPositionEn"
                    value={formData.contactPerson.positionEn}
                    onChange={(e) => handleNestedInputChange('contactPerson', 'positionEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'Enter position' : 'Enter position'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-sm font-medium">
                    {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email Address'} *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleNestedInputChange('contactPerson', 'email', e.target.value)}
                      className={`pl-10 border-2 focus:border-[#1B4FFF] ${errors['contactPerson.email'] ? 'border-red-500' : ''}`}
                      placeholder={dir === 'rtl' ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                    />
                  </div>
                  {errors['contactPerson.email'] && (
                    <p className="text-red-500 text-xs">{errors['contactPerson.email']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm font-medium">
                    {dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'} *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleNestedInputChange('contactPerson', 'phone', e.target.value)}
                      className={`pl-10 border-2 focus:border-[#1B4FFF] ${errors['contactPerson.phone'] ? 'border-red-500' : ''}`}
                      placeholder={dir === 'rtl' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                    />
                  </div>
                  {errors['contactPerson.phone'] && (
                    <p className="text-red-500 text-xs">{errors['contactPerson.phone']}</p>
                  )}
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
                  <Label htmlFor="city" className="text-sm font-medium">
                    {dir === 'rtl' ? 'المدينة (عربي)' : 'City (Arabic)'}
                  </Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'أدخل المدينة' : 'Enter city'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityEn" className="text-sm font-medium">
                    {dir === 'rtl' ? 'المدينة (إنجليزي)' : 'City (English)'}
                  </Label>
                  <Input
                    id="cityEn"
                    value={formData.address.cityEn}
                    onChange={(e) => handleNestedInputChange('address', 'cityEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'Enter city' : 'Enter city'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    {dir === 'rtl' ? 'الدولة (عربي)' : 'Country (Arabic)'}
                  </Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'أدخل الدولة' : 'Enter country'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryEn" className="text-sm font-medium">
                    {dir === 'rtl' ? 'الدولة (إنجليزي)' : 'Country (English)'}
                  </Label>
                  <Input
                    id="countryEn"
                    value={formData.address.countryEn}
                    onChange={(e) => handleNestedInputChange('address', 'countryEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF]"
                    placeholder={dir === 'rtl' ? 'Enter country' : 'Enter country'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Notes */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'العلامات والملاحظات' : 'Tags & Notes'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-2 block">{dir === 'rtl' ? 'العلامات' : 'Tags'}</Label>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-[#1B4FFF]/10 to-[#0A1E39]/10 text-foreground border border-[#1B4FFF]/20 px-3 py-1 flex items-center gap-2"
                      >
                        <span>{dir === 'rtl' ? tag : formData.tagsEn[index]}</span>
                        <button
                          onClick={() => handleRemoveTag(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="border-2 focus:border-[#1B4FFF]"
                      placeholder={dir === 'rtl' ? 'علامة جديدة (عربي)' : 'New tag (Arabic)'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={newTagEn}
                      onChange={(e) => setNewTagEn(e.target.value)}
                      className="border-2 focus:border-[#1B4FFF]"
                      placeholder={dir === 'rtl' ? 'علامة جديدة (إنجليزي)' : 'New tag (English)'}
                    />
                  </div>
                  <div>
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
              </div>

              {/* Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    {dir === 'rtl' ? 'ملاحظات (عربي)' : 'Notes (Arabic)'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF] min-h-[100px]"
                    placeholder={dir === 'rtl' ? 'أدخل ملاحظات إضافية' : 'Enter additional notes'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notesEn" className="text-sm font-medium">
                    {dir === 'rtl' ? 'ملاحظات (إنجليزي)' : 'Notes (English)'}
                  </Label>
                  <Textarea
                    id="notesEn"
                    value={formData.notesEn}
                    onChange={(e) => handleInputChange('notesEn', e.target.value)}
                    className="border-2 focus:border-[#1B4FFF] min-h-[100px]"
                    placeholder={dir === 'rtl' ? 'Enter additional notes' : 'Enter additional notes'}
                  />
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
            onClick={handleReset}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            {dir === 'rtl' ? 'إعادة تعيين' : 'Reset'}
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'إضافة العميل' : 'Add Client'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}