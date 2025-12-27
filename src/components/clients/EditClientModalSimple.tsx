import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSave: (clientData: any) => void;
}

export function EditClientModal({ isOpen, onClose, client, onSave }: EditClientModalProps) {
  const { dir } = useLanguage();
  const [formData, setFormData] = useState({
    organization: '',
    organizationEn: '',
    industry: '',
    industryEn: '',
    contactName: '',
    contactNameEn: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        organization: client.organization || '',
        organizationEn: client.organizationEn || '',
        industry: client.industry || '',
        industryEn: client.industryEn || '',
        contactName: client.contactPerson?.name || '',
        contactNameEn: client.contactPerson?.nameEn || '',
        email: client.contactPerson?.email || '',
        phone: client.contactPerson?.phone || ''
      });
    }
  }, [client]);

  if (!client) return null;

  const handleSave = () => {
    const updatedClient = {
      ...client,
      organization: formData.organization,
      organizationEn: formData.organizationEn,
      industry: formData.industry,
      industryEn: formData.industryEn,
      contactPerson: {
        ...client.contactPerson,
        name: formData.contactName,
        nameEn: formData.contactNameEn,
        email: formData.email,
        phone: formData.phone
      }
    };
    onSave(updatedClient);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {dir === 'rtl' ? 'تحرير بيانات العميل' : 'Edit Client Information'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{dir === 'rtl' ? 'اسم المؤسسة (عربي)' : 'Organization Name (Arabic)'}</Label>
              <Input
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'اسم المؤسسة (إنجليزي)' : 'Organization Name (English)'}</Label>
              <Input
                value={formData.organizationEn}
                onChange={(e) => setFormData({...formData, organizationEn: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{dir === 'rtl' ? 'القطاع (عربي)' : 'Industry (Arabic)'}</Label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'القطاع (إنجليزي)' : 'Industry (English)'}</Label>
              <Input
                value={formData.industryEn}
                onChange={(e) => setFormData({...formData, industryEn: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{dir === 'rtl' ? 'اسم مسؤول التواصل (عربي)' : 'Communication Manager Name (Arabic)'}</Label>
              <Input
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'اسم مسؤول التواصل (إنجليزي)' : 'Communication Manager Name (English)'}</Label>
              <Input
                value={formData.contactNameEn}
                onChange={(e) => setFormData({...formData, contactNameEn: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email Address'}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} className="bg-[#1B4FFF] text-white">
            {dir === 'rtl' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}